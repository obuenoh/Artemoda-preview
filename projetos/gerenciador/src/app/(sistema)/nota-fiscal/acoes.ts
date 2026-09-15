'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { relatorioPeriodo, aplicarDesconto } from '@/lib/notafiscal';

export type Resultado = { erro?: string } | null;

/**
 * Cria a nota em RASCUNHO. Nunca emite de verdade — falta a integracao com
 * um provedor homologado (ver CLAUDE.md: nunca falar direto com a SEFAZ).
 * O rascunho existe para a dona ver o calculo e já ter o registro pronto
 * no dia em que a parte fiscal for ligada.
 */
export async function gerarNotaFiscal(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona');

  const inicio = String(form.get('inicio') ?? '');
  const fim = String(form.get('fim') ?? '');
  const clienteId = String(form.get('clienteId') ?? '') || undefined;
  const descontoPercentualCem = Math.round(Number(form.get('descontoPercentual') ?? '0') * 100);
  const descontoValorCentavos = Math.round(Number(String(form.get('descontoValor') ?? '0').replace(',', '.')) * 100);

  if (!inicio || !fim) return { erro: 'Escolha o período.' };

  const dataInicio = new Date(`${inicio}T00:00:00`);
  const dataFim = new Date(`${fim}T23:59:59`);
  if (dataFim < dataInicio) return { erro: 'A data final não pode ser antes da inicial.' };

  const relatorio = await relatorioPeriodo(usuario.empresaId, dataInicio, dataFim, clienteId);
  if (relatorio.itens.length === 0) {
    return { erro: 'Não há vendas nesse período para gerar a nota.' };
  }

  const totalComDesconto = aplicarDesconto(
    relatorio.totalCentavos,
    descontoPercentualCem,
    descontoValorCentavos,
  );

  const nota = await db.notaFiscal.create({
    data: {
      empresaId: usuario.empresaId,
      clienteId: clienteId || null,
      periodoInicio: dataInicio,
      periodoFim: dataFim,
      totalVendasCentavos: relatorio.totalCentavos,
      descontoPercentualCem,
      descontoValorCentavos,
      totalComDescontoCentavos: totalComDesconto,
      status: 'rascunho',
      usuarioId: usuario.id,
      vendas: { create: relatorio.itens.map((i) => ({ vendaId: i.vendaId })) },
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'nota_fiscal',
    entidadeId: nota.id,
    acao: 'criou',
    resumo: `Gerou rascunho de nota fiscal — ${relatorio.itens.length} venda(s)`,
  });

  revalidatePath('/nota-fiscal');
  redirect(`/nota-fiscal/${nota.id}`);
}


export type PreviaNota = {
  itens: { vendaId: string; data: string; clienteNome: string; canal: string; totalCentavos: number; pecas: number }[];
  totalCentavos: number;
  totalPecas: number;
  totalComDescontoCentavos: number;
};

/** Prévia calculada sob demanda (botão "Calcular"), sem gravar nada. */
export async function previsualizarRelatorio(dados: {
  inicio: string;
  fim: string;
  clienteId?: string;
  descontoPercentual: number;
  descontoValor: number;
}): Promise<{ erro: string } | { ok: true; previa: PreviaNota }> {
  await exigirPapel('dona');

  if (!dados.inicio || !dados.fim) return { erro: 'Escolha o período.' };
  const dataInicio = new Date(`${dados.inicio}T00:00:00`);
  const dataFim = new Date(`${dados.fim}T23:59:59`);
  if (dataFim < dataInicio) return { erro: 'A data final não pode ser antes da inicial.' };

  const usuario = await exigirPapel('dona');
  const relatorio = await relatorioPeriodo(usuario.empresaId, dataInicio, dataFim, dados.clienteId || undefined);

  const descontoPercentualCem = Math.round(dados.descontoPercentual * 100);
  const descontoValorCentavos = Math.round(dados.descontoValor * 100);
  const totalComDesconto = aplicarDesconto(relatorio.totalCentavos, descontoPercentualCem, descontoValorCentavos);

  return {
    ok: true,
    previa: {
      itens: relatorio.itens.map((i) => ({
        vendaId: i.vendaId,
        data: i.data.toISOString(),
        clienteNome: i.clienteNome,
        canal: i.canal,
        totalCentavos: i.totalCentavos,
        pecas: i.pecas,
      })),
      totalCentavos: relatorio.totalCentavos,
      totalPecas: relatorio.totalPecas,
      totalComDescontoCentavos: totalComDesconto,
    },
  };
}
