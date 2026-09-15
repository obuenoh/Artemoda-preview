import { db } from './db';

/**
 * Leituras agregadas de venda, usadas pela Visão Geral e pela própria tela
 * de Vendas. Nada aqui escreve — a escrita mora em
 * src/app/(sistema)/vendas/acoes.ts, junto com o razão de produto acabado.
 */

export type ResumoVendas = {
  totalCentavos: number;
  quantidadeVendas: number;
  totalLojaCentavos: number;
  totalProducaoCentavos: number;
};

export async function resumoVendas(
  empresaId: string,
  inicio: Date,
  fim: Date,
): Promise<ResumoVendas> {
  const vendas = await db.venda.findMany({
    where: { empresaId, criadoEm: { gte: inicio, lte: fim } },
    select: { totalCentavos: true, canal: true },
  });

  return {
    totalCentavos: vendas.reduce((s, v) => s + v.totalCentavos, 0),
    quantidadeVendas: vendas.length,
    totalLojaCentavos: vendas.filter((v) => v.canal === 'loja').reduce((s, v) => s + v.totalCentavos, 0),
    totalProducaoCentavos: vendas
      .filter((v) => v.canal === 'producao')
      .reduce((s, v) => s + v.totalCentavos, 0),
  };
}

export type PontoVendaDia = { dia: string; totalCentavos: number };

/**
 * Chave de dia em horário LOCAL, não UTC. `toISOString()` converte para
 * UTC — num fuso atrás de UTC (Brasil é UTC-3), uma venda das 22h já vira
 * "amanhã" na chave, e o dia de hoje aparece partido em dois no gráfico.
 * Já aconteceu uma vez.
 */
function chaveDiaLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Um ponto por dia no período, com zero explícito nos dias sem venda. */
export async function vendasPorDia(
  empresaId: string,
  inicio: Date,
  fim: Date,
): Promise<PontoVendaDia[]> {
  const vendas = await db.venda.findMany({
    where: { empresaId, criadoEm: { gte: inicio, lte: fim } },
    select: { totalCentavos: true, criadoEm: true },
  });

  const porDia = new Map<string, number>();
  const cursor = new Date(inicio);
  cursor.setHours(0, 0, 0, 0);
  const limite = new Date(fim);
  while (cursor <= limite) {
    porDia.set(chaveDiaLocal(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const v of vendas) {
    const chave = chaveDiaLocal(v.criadoEm);
    porDia.set(chave, (porDia.get(chave) ?? 0) + v.totalCentavos);
  }

  return [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dia, totalCentavos]) => ({ dia, totalCentavos }));
}

export type ClienteRanking = { clienteId: string | null; nome: string; totalCentavos: number; vendas: number };

/** Maiores clientes no período, separados por canal (produção vs loja). */
export async function rankingClientes(
  empresaId: string,
  inicio: Date,
  fim: Date,
  canal: 'loja' | 'producao',
): Promise<ClienteRanking[]> {
  const vendas = await db.venda.findMany({
    where: { empresaId, canal, criadoEm: { gte: inicio, lte: fim } },
    include: { cliente: { select: { nome: true } } },
  });

  const porCliente = new Map<string, ClienteRanking>();
  for (const v of vendas) {
    const chave = v.clienteId ?? '__balcao__';
    const atual = porCliente.get(chave) ?? {
      clienteId: v.clienteId,
      nome: v.cliente?.nome ?? 'Venda de balcão (sem cliente)',
      totalCentavos: 0,
      vendas: 0,
    };
    atual.totalCentavos += v.totalCentavos;
    atual.vendas += 1;
    porCliente.set(chave, atual);
  }

  return [...porCliente.values()].sort((a, b) => b.totalCentavos - a.totalCentavos);
}

export type ProdutoRanking = { nome: string; quantidade: number; totalCentavos: number };

export async function produtosMaisVendidos(
  empresaId: string,
  inicio: Date,
  fim: Date,
  limite = 5,
): Promise<ProdutoRanking[]> {
  const itens = await db.vendaItem.findMany({
    where: { venda: { empresaId, criadoEm: { gte: inicio, lte: fim } } },
    include: { produtoAcabado: { select: { nome: true, tamanho: true, cor: true } } },
  });

  const porProduto = new Map<string, ProdutoRanking>();
  for (const i of itens) {
    const nome = [i.produtoAcabado.nome, i.produtoAcabado.tamanho, i.produtoAcabado.cor]
      .filter(Boolean)
      .join(' · ');
    const atual = porProduto.get(nome) ?? { nome, quantidade: 0, totalCentavos: 0 };
    atual.quantidade += i.quantidade;
    atual.totalCentavos += i.quantidade * i.precoUnitarioCentavos;
    porProduto.set(nome, atual);
  }

  return [...porProduto.values()].sort((a, b) => b.totalCentavos - a.totalCentavos).slice(0, limite);
}
