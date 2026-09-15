import { db } from './db';

/**
 * Cálculo do relatório/nota por período. Não fala com nenhum provedor
 * fiscal — isso ainda não existe (ver nota no schema, model NotaFiscal).
 * Esta função só soma o que já está gravado em Venda.
 */
export type ItemRelatorio = {
  vendaId: string;
  data: Date;
  clienteNome: string;
  canal: string;
  totalCentavos: number;
  pecas: number;
};

export type RelatorioPeriodo = {
  itens: ItemRelatorio[];
  totalCentavos: number;
  totalPecas: number;
};

export async function relatorioPeriodo(
  empresaId: string,
  inicio: Date,
  fim: Date,
  clienteId?: string,
): Promise<RelatorioPeriodo> {
  const vendas = await db.venda.findMany({
    where: {
      empresaId,
      criadoEm: { gte: inicio, lte: fim },
      ...(clienteId ? { clienteId } : {}),
    },
    include: { cliente: { select: { nome: true } }, itens: true },
    orderBy: { criadoEm: 'asc' },
  });

  const itens: ItemRelatorio[] = vendas.map((v) => ({
    vendaId: v.id,
    data: v.criadoEm,
    clienteNome: v.cliente?.nome ?? 'Venda de balcão',
    canal: v.canal,
    totalCentavos: v.totalCentavos,
    pecas: v.itens.reduce((s, i) => s + i.quantidade, 0),
  }));

  return {
    itens,
    totalCentavos: itens.reduce((s, i) => s + i.totalCentavos, 0),
    totalPecas: itens.reduce((s, i) => s + i.pecas, 0),
  };
}

/** Desconto percentual em centésimos de ponto (1050 = 10,50%). */
export function aplicarDesconto(
  totalCentavos: number,
  descontoPercentualCem: number,
  descontoValorCentavos: number,
): number {
  const peloPercentual = Math.round((totalCentavos * descontoPercentualCem) / 10_000);
  const resultado = totalCentavos - peloPercentual - descontoValorCentavos;
  return Math.max(resultado, 0);
}
