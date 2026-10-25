'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { lancar, estadoAtual, tipoRetalho } from '@/lib/estoque';
import { numeroParaMil, reaisParaCentavos, milFormatado, centavosParaReais } from '@/lib/numeros';

export type Resultado = { erro?: string; campos?: Record<string, string>; ok?: string } | null;

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? '').trim();

function revalidarEstoque() {
  revalidatePath('/estoque', 'layout');
  revalidatePath('/');
}

/**
 * Retalho anotado: ela diz de qual tecido, a cor e quantos kg. Retalho do
 * mesmo tecido e da mesma cor soma no mesmo item — e o extrato mostra cada
 * vez que foi anotado. O valor do kg vem sugerido pela tela e e ela quem
 * confirma: e uma estimativa, e o motivo do lancamento diz isso.
 */
export async function anotarRetalho(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const tecidoId = texto(form, 'tecidoId');
  const nomeOutro = texto(form, 'nomeOutro');
  const cor = texto(form, 'cor');
  const pesoMil = numeroParaMil(texto(form, 'peso'));
  const valorKg = reaisParaCentavos(texto(form, 'valorKg'));
  const localizacao = texto(form, 'localizacao');

  const campos: Record<string, string> = {};
  if (!tecidoId) campos.tecidoId = 'Escolha de qual tecido é o retalho.';
  if (tecidoId === 'outro' && nomeOutro.length < 2) campos.nomeOutro = 'Diga que tecido é, como "Helanca".';
  if (cor.length < 2) campos.cor = 'Informe a cor, como "Azul marinho".';
  if (pesoMil === null || pesoMil <= 0) campos.peso = 'Informe quantos quilos, como 3,5.';
  if (valorKg === null || valorKg <= 0) campos.valorKg = 'Informe quanto vale o quilo, mesmo que seja um palpite.';

  const tecido =
    tecidoId && tecidoId !== 'outro'
      ? await db.materiaPrima.findFirst({ where: { id: tecidoId, empresaId: usuario.empresaId } })
      : null;
  if (tecidoId && tecidoId !== 'outro' && !tecido) campos.tecidoId = 'Esse tecido não foi encontrado. Escolha de novo.';

  if (Object.keys(campos).length > 0 || !pesoMil || !valorKg) return { erro: 'Confira os campos marcados.', campos };

  const nomeTecido = tecido?.nome ?? nomeOutro;
  const nome = `Retalho de ${nomeTecido}`;

  const itemId = await db.$transaction(async (tx) => {
    const tipo = await tipoRetalho(usuario.empresaId, tx);

    // Mesmo tecido e mesma cor (sem diferenciar maiuscula) vira o mesmo item.
    const candidatos = await tx.materiaPrima.findMany({
      where: { empresaId: usuario.empresaId, tipoProdutoId: tipo.id, ativo: true, ...(tecido ? { retalhoDeId: tecido.id } : { nome }) },
    });
    const existente = candidatos.find((c) => (c.cor ?? '').toLowerCase() === cor.toLowerCase());

    const item =
      existente ??
      (await tx.materiaPrima.create({
        data: {
          empresaId: usuario.empresaId,
          tipoProdutoId: tipo.id,
          nome,
          cor,
          composicao: tecido?.composicao ?? null,
          larguraMil: tecido?.larguraMil ?? null,
          gramaturaGm2: tecido?.gramaturaGm2 ?? null,
          unidade: 'kg',
          localizacao: localizacao || null,
          retalhoDeId: tecido?.id ?? null,
        },
      }));

    await lancar(
      {
        empresaId: usuario.empresaId,
        materiaPrimaId: item.id,
        tipo: 'entrada_retalho',
        quantidadeMil: pesoMil,
        custoUnitarioCentavos: valorKg,
        origemTipo: 'manual',
        motivo: `Retalho anotado — ${centavosParaReais(valorKg)} o kg, valor estimado`,
        usuarioId: usuario.id,
      },
      tx,
    );

    return item.id;
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'materia_prima',
    entidadeId: itemId,
    acao: 'criou',
    resumo: `Anotou ${milFormatado(pesoMil, 'kg')} de retalho de ${nomeTecido} ${cor}`,
  });

  revalidarEstoque();
  return { ok: `Anotado: ${milFormatado(pesoMil, 'kg')} de ${nomeTecido.toLowerCase()} ${cor.toLowerCase()}.` };
}

/**
 * Saida de qualquer item de estoque: usou na producao, vendeu, doou ou
 * jogou fora. Sai valorizado pelo custo medio, como toda saida.
 */
export async function registrarSaida(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const id = texto(form, 'id');
  const destino = texto(form, 'destino');
  const motivo = texto(form, 'motivo');
  const quantidadeMil = numeroParaMil(texto(form, 'quantidade'));

  const item = await db.materiaPrima.findFirst({ where: { id, empresaId: usuario.empresaId } });
  if (!item) return { erro: 'Item não encontrado. Recarregue a página.' };

  const estado = await estadoAtual(item.id);
  const campos: Record<string, string> = {};
  if (quantidadeMil === null || quantidadeMil <= 0) campos.quantidade = 'Informe quanto saiu, como 1,5.';
  else if (quantidadeMil > estado.saldoMil) {
    campos.quantidade = `Só tem ${milFormatado(estado.saldoMil, item.unidade)} anotado. Se tinha mais, faça uma contagem.`;
  }
  if (destino !== 'producao' && destino !== 'fora') campos.destino = 'Escolha para onde foi.';
  if (destino === 'fora' && motivo.length < 3) campos.motivo = 'Conte o que aconteceu: vendeu, doou, jogou fora.';
  if (Object.keys(campos).length > 0 || !quantidadeMil) return { erro: 'Confira os campos marcados.', campos };

  await lancar({
    empresaId: usuario.empresaId,
    materiaPrimaId: item.id,
    tipo: destino === 'producao' ? 'saida_producao' : 'perda',
    quantidadeMil: -quantidadeMil,
    origemTipo: 'manual',
    motivo: motivo || (destino === 'producao' ? 'Usado na produção' : undefined),
    usuarioId: usuario.id,
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'materia_prima',
    entidadeId: item.id,
    acao: 'ajustou',
    resumo: `Saída de ${milFormatado(quantidadeMil, item.unidade)} de ${item.nome}${motivo ? `: ${motivo}` : ''}`,
  });

  revalidarEstoque();
  return { ok: 'Saída registrada.' };
}
