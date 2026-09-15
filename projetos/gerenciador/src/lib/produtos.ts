import type { Prisma, PrismaClient } from '@prisma/client';
import { db } from './db';

/**
 * RAZAO DE PRODUTO ACABADO — mesmo principio do estoque de tecido
 * (src/lib/estoque.ts), aplicado a peca pronta na loja. Saldo e soma de
 * lancamentos, nunca campo. Nada aqui faz UPDATE em quantidade.
 *
 * Diferenca deliberada: quantidade em unidades inteiras, sem milesimos —
 * peca de roupa nao e fracionaria.
 */

export type TipoMovimentoProduto =
  | 'entrada_producao'
  | 'saida_venda'
  | 'ajuste_inventario'
  | 'perda';

export const rotuloMovimentoProduto: Record<TipoMovimentoProduto, string> = {
  entrada_producao: 'Entrou da produção',
  saida_venda: 'Vendida',
  ajuste_inventario: 'Ajuste de contagem',
  perda: 'Perda',
};

type Cliente = PrismaClient | Prisma.TransactionClient;

export type EstadoProduto = {
  saldo: number;
  ultimoMovimentoEm: Date | null;
};

/**
 * Diferente do estoque de tecido, aqui nao existe custo medio ponderado
 * recalculado a cada entrada: peca pronta tem um custo fixo por SKU
 * (`ProdutoAcabado.custoCentavos`, definido por quem cadastra a peca), nao
 * um custo que varia por lote de compra.
 */
export async function estadoProduto(
  produtoAcabadoId: string,
  tx: Cliente = db,
): Promise<EstadoProduto> {
  const ultimo = await tx.movimentoProdutoAcabado.findFirst({
    where: { produtoAcabadoId },
    orderBy: { criadoEm: 'desc' },
  });

  if (!ultimo) return { saldo: 0, ultimoMovimentoEm: null };

  return { saldo: ultimo.saldoAposUnidades, ultimoMovimentoEm: ultimo.criadoEm };
}

export type LancamentoProduto = {
  empresaId: string;
  produtoAcabadoId: string;
  tipo: TipoMovimentoProduto;
  /** Com sinal: positivo entra, negativo sai. */
  quantidade: number;
  custoUnitarioCentavos?: number;
  origemTipo?: string;
  origemId?: string;
  motivo?: string;
  usuarioId?: string;
};

export async function lancarProduto(mov: LancamentoProduto, tx: Cliente = db) {
  if (mov.quantidade === 0) {
    throw new Error('Lançamento de produto com quantidade zero não faz sentido.');
  }

  const estado = await estadoProduto(mov.produtoAcabadoId, tx);
  const saldoApos = estado.saldo + mov.quantidade;

  if (saldoApos < 0) {
    throw new Error('Não há peças suficientes em estoque para esta saída.');
  }

  return tx.movimentoProdutoAcabado.create({
    data: {
      empresaId: mov.empresaId,
      produtoAcabadoId: mov.produtoAcabadoId,
      tipo: mov.tipo,
      quantidade: mov.quantidade,
      custoUnitarioCentavos: mov.custoUnitarioCentavos ?? 0,
      saldoAposUnidades: saldoApos,
      origemTipo: mov.origemTipo,
      origemId: mov.origemId,
      motivo: mov.motivo,
      usuarioId: mov.usuarioId,
    },
  });
}

export type LinhaProduto = {
  id: string;
  nome: string;
  tamanho: string | null;
  cor: string | null;
  sku: string;
  precoVendaCentavos: number;
  estoqueMinimo: number;
  saldo: number;
  abaixoDoMinimo: boolean;
};

export async function posicaoProdutos(empresaId: string): Promise<LinhaProduto[]> {
  const produtos = await db.produtoAcabado.findMany({
    where: { empresaId, ativo: true },
    orderBy: { nome: 'asc' },
  });

  const linhas: LinhaProduto[] = [];
  for (const p of produtos) {
    const estado = await estadoProduto(p.id);
    linhas.push({
      id: p.id,
      nome: p.nome,
      tamanho: p.tamanho,
      cor: p.cor,
      sku: p.sku,
      precoVendaCentavos: p.precoVendaCentavos,
      estoqueMinimo: p.estoqueMinimo,
      saldo: estado.saldo,
      abaixoDoMinimo: p.estoqueMinimo > 0 && estado.saldo < p.estoqueMinimo,
    });
  }
  return linhas;
}

/** Busca por SKU/código de barras — usada pelo campo de bipagem. */
export async function buscarPorSku(empresaId: string, sku: string) {
  const limpo = sku.trim();
  if (!limpo) return null;
  return db.produtoAcabado.findUnique({
    where: { empresaId_sku: { empresaId, sku: limpo } },
  });
}
