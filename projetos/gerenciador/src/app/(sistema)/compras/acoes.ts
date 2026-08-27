'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { numeroParaMil, reaisParaCentavos, custoUnitario, valorDe } from '@/lib/numeros';
import { lancar, estadoAtual } from '@/lib/estoque';

export type Resultado = { erro?: string; campos?: Record<string, string> } | null;

/**
 * Uma compra e um fato: entra tecido e entra custo. O rateio do frete e
 * calculado pelo sistema, por valor — ela nunca digita isso ("nao pedir o
 * que da para calcular sozinho").
 */
export async function registrarCompra(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const fornecedorId = String(form.get('fornecedorId') ?? '');
  const numeroNf = String(form.get('numeroNf') ?? '').trim();
  const data = String(form.get('data') ?? '');
  const frete = reaisParaCentavos(String(form.get('frete') ?? '0')) ?? 0;
  const outros = reaisParaCentavos(String(form.get('outrosCustos') ?? '0')) ?? 0;
  const observacoes = String(form.get('observacoes') ?? '').trim();

  const campos: Record<string, string> = {};
  if (!fornecedorId) campos.fornecedorId = 'Escolha de quem você comprou.';
  if (!data) campos.data = 'Informe o dia da compra.';

  // Itens chegam como arrays paralelos.
  const ids = form.getAll('itemMateriaPrimaId').map(String);
  const qtds = form.getAll('itemQuantidade').map(String);
  const vals = form.getAll('itemValorUnitario').map(String);

  type Item = { materiaPrimaId: string; quantidadeMil: number; valorUnitarioCentavos: number };
  const itens: Item[] = [];

  for (let i = 0; i < ids.length; i++) {
    if (!ids[i] && !qtds[i] && !vals[i]) continue; // linha em branco: ignora
    if (!ids[i]) {
      campos[`item${i}`] = 'Escolha o tecido desta linha.';
      continue;
    }
    const q = numeroParaMil(qtds[i] ?? '');
    const v = reaisParaCentavos(vals[i] ?? '');
    if (q === null || q <= 0) {
      campos[`item${i}`] = 'Informe quanto entrou, como 50 ou 50,5.';
      continue;
    }
    if (v === null || v <= 0) {
      campos[`item${i}`] = 'Informe o preço da unidade, como 18,40.';
      continue;
    }
    itens.push({ materiaPrimaId: ids[i], quantidadeMil: q, valorUnitarioCentavos: v });
  }

  if (itens.length === 0 && Object.keys(campos).length === 0) {
    return { erro: 'Adicione pelo menos um tecido nesta compra.' };
  }
  if (Object.keys(campos).length > 0) return { erro: 'Confira os campos marcados.', campos };

  const totalMercadoria = itens.reduce(
    (s, i) => s + valorDe(i.quantidadeMil, i.valorUnitarioCentavos),
    0,
  );
  const custosExtras = frete + outros;

  const compraId = await db.$transaction(async (tx) => {
    const compra = await tx.compra.create({
      data: {
        empresaId: usuario.empresaId,
        fornecedorId,
        numeroNf: numeroNf || null,
        data: new Date(data),
        freteCentavos: frete,
        outrosCustosCentavos: outros,
        observacoes: observacoes || null,
      },
    });

    for (const item of itens) {
      const valorItem = valorDe(item.quantidadeMil, item.valorUnitarioCentavos);
      // Rateio por valor: item que custou mais absorve mais frete.
      const rateio =
        totalMercadoria > 0 ? Math.round((custosExtras * valorItem) / totalMercadoria) : 0;

      await tx.compraItem.create({
        data: {
          compraId: compra.id,
          materiaPrimaId: item.materiaPrimaId,
          quantidadeMil: item.quantidadeMil,
          valorUnitarioCentavos: item.valorUnitarioCentavos,
          rateioCentavos: rateio,
        },
      });

      // O custo que entra no estoque ja inclui a parte do frete.
      const custoReal = custoUnitario(valorItem + rateio, item.quantidadeMil);

      await lancar(
        {
          empresaId: usuario.empresaId,
          materiaPrimaId: item.materiaPrimaId,
          tipo: 'entrada_compra',
          quantidadeMil: item.quantidadeMil,
          custoUnitarioCentavos: custoReal,
          origemTipo: 'compra',
          origemId: compra.id,
          motivo: numeroNf ? `Nota ${numeroNf}` : 'Compra sem nota informada',
          usuarioId: usuario.id,
        },
        tx,
      );
    }

    return compra.id;
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'compra',
    entidadeId: compraId,
    acao: 'criou',
    resumo: `Registrou compra com ${itens.length} item(ns)`,
  });

  revalidatePath('/compras');
  revalidatePath('/estoque');
  revalidatePath('/');
  redirect('/compras');
}

/**
 * Contagem fisica. A diferenca vira lancamento de AJUSTE — o saldo antigo
 * nunca e sobrescrito, e o motivo e obrigatorio.
 */
export async function aplicarContagem(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const ids = form.getAll('materiaPrimaId').map(String);
  const contagens = form.getAll('contagem').map(String);
  const motivos = form.getAll('motivo').map(String);
  const custos = form.getAll('custoEstimado').map(String);
  const abertura = form.get('abertura') === 'sim';

  const campos: Record<string, string> = {};
  type Ajuste = { id: string; diferenca: number; motivo: string; custo?: number };
  const ajustes: Ajuste[] = [];

  for (let i = 0; i < ids.length; i++) {
    const texto = contagens[i]?.trim();
    if (!texto) continue; // nao contou este item: nao mexe

    const contadoMil = numeroParaMil(texto);
    if (contadoMil === null || contadoMil < 0) {
      campos[`contagem${i}`] = 'Use só número, como 128 ou 128,5.';
      continue;
    }

    const estado = await estadoAtual(ids[i]);
    const diferenca = contadoMil - estado.saldoMil;
    if (diferenca === 0) continue;

    const motivo = motivos[i]?.trim() ?? '';
    if (!motivo) {
      campos[`motivo${i}`] = 'Diferença sem motivo não entra. Conte o que aconteceu.';
      continue;
    }

    // Sobra so entra no estoque com um custo. No estoque de abertura ela
    // informa; numa contagem comum, vale o custo medio que ja existe.
    let custo: number | undefined;
    if (diferenca > 0) {
      if (abertura) {
        const informado = reaisParaCentavos(custos[i] ?? '');
        if (informado === null || informado <= 0) {
          campos[`custo${i}`] = 'No estoque de abertura, informe quanto custou o metro/quilo.';
          continue;
        }
        custo = informado;
      } else if (estado.custoMedioCentavos > 0) {
        custo = estado.custoMedioCentavos;
      } else {
        const informado = reaisParaCentavos(custos[i] ?? '');
        if (informado === null || informado <= 0) {
          campos[`custo${i}`] =
            'Esse tecido ainda não tem custo no sistema. Informe quanto custou o metro/quilo.';
          continue;
        }
        custo = informado;
      }
    }

    ajustes.push({ id: ids[i], diferenca, motivo, custo });
  }

  if (Object.keys(campos).length > 0) return { erro: 'Confira os campos marcados.', campos };
  if (ajustes.length === 0) {
    return { erro: 'Nenhuma diferença para ajustar. Se contou tudo certo, não há o que fazer.' };
  }

  const inventarioId = await db.$transaction(async (tx) => {
    const inventario = await tx.inventario.create({
      data: {
        empresaId: usuario.empresaId,
        data: new Date(),
        status: 'aplicado',
        abertura,
      },
    });

    for (const a of ajustes) {
      await lancar(
        {
          empresaId: usuario.empresaId,
          materiaPrimaId: a.id,
          tipo: abertura ? 'entrada_inicial' : 'ajuste_inventario',
          quantidadeMil: a.diferenca,
          custoUnitarioCentavos: a.custo,
          origemTipo: 'inventario',
          origemId: inventario.id,
          motivo: a.motivo,
          usuarioId: usuario.id,
        },
        tx,
      );
    }

    return inventario.id;
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'inventario',
    entidadeId: inventarioId,
    acao: 'ajustou',
    resumo: `${abertura ? 'Estoque de abertura' : 'Contagem'} com ${ajustes.length} ajuste(s)`,
  });

  revalidatePath('/estoque');
  revalidatePath('/');
  redirect('/estoque');
}
