import type { Prisma, PrismaClient } from '@prisma/client';
import { db } from './db';
import { LISTA_FRENTES, naFrente, type Frente } from './frentes';

/**
 * RAZAO DE PRODUTO ACABADO — mesmo principio do estoque de tecido
 * (src/lib/estoque.ts), aplicado a peca pronta. Saldo e soma de
 * lancamentos, nunca campo. Nada aqui faz UPDATE em quantidade.
 *
 * O saldo e POR FRENTE (Fabrica, Loja, E-commerce). Toda peca nasce na
 * Fabrica; Loja e E-commerce recebem por envio. Cada venda baixa do estoque
 * da propria frente.
 *
 * Diferenca deliberada: quantidade em unidades inteiras, sem milesimos —
 * peca de roupa nao e fracionaria.
 */

export type TipoMovimentoProduto =
  | 'entrada_producao'
  | 'saida_venda'
  | 'envio_saida'
  | 'envio_entrada'
  | 'ajuste_inventario'
  | 'perda';

export const rotuloMovimentoProduto: Record<TipoMovimentoProduto, string> = {
  entrada_producao: 'Entrou da produção',
  saida_venda: 'Vendida',
  envio_saida: 'Enviada',
  envio_entrada: 'Recebida',
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
  frente: Frente,
  tx: Cliente = db,
): Promise<EstadoProduto> {
  const ultimo = await tx.movimentoProdutoAcabado.findFirst({
    where: { produtoAcabadoId, frente },
    orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
  });

  if (!ultimo) return { saldo: 0, ultimoMovimentoEm: null };

  return { saldo: ultimo.saldoAposUnidades, ultimoMovimentoEm: ultimo.criadoEm };
}

export type LancamentoProduto = {
  empresaId: string;
  produtoAcabadoId: string;
  /** Em qual estoque a peca entra ou de qual sai. */
  frente: Frente;
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

  const estado = await estadoProduto(mov.produtoAcabadoId, mov.frente, tx);
  const saldoApos = estado.saldo + mov.quantidade;

  if (saldoApos < 0) {
    throw new Error(
      `Não há peças suficientes ${naFrente(mov.frente)}: tem ${estado.saldo}, saindo ${-mov.quantidade}.`,
    );
  }

  return tx.movimentoProdutoAcabado.create({
    data: {
      empresaId: mov.empresaId,
      produtoAcabadoId: mov.produtoAcabadoId,
      frente: mov.frente,
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
  /** Saldo em cada frente. */
  saldos: Record<Frente, number>;
  /** Soma das tres frentes: e o que o minimo compara. */
  saldo: number;
  abaixoDoMinimo: boolean;
};

/** Saldo de cada peca em cada frente, numa consulta so (soma dos lancamentos). */
export async function posicaoProdutos(empresaId: string): Promise<LinhaProduto[]> {
  const [produtos, somas] = await Promise.all([
    db.produtoAcabado.findMany({ where: { empresaId, ativo: true }, orderBy: [{ nome: 'asc' }, { tamanho: 'asc' }] }),
    db.movimentoProdutoAcabado.groupBy({
      by: ['produtoAcabadoId', 'frente'],
      where: { empresaId },
      _sum: { quantidade: true },
    }),
  ]);

  return produtos.map((p) => {
    const saldos = Object.fromEntries(LISTA_FRENTES.map((f) => [f, 0])) as Record<Frente, number>;
    for (const s of somas) {
      if (s.produtoAcabadoId === p.id && s.frente in saldos) saldos[s.frente as Frente] = s._sum.quantidade ?? 0;
    }
    const saldo = LISTA_FRENTES.reduce((t, f) => t + saldos[f], 0);
    return {
      id: p.id,
      nome: p.nome,
      tamanho: p.tamanho,
      cor: p.cor,
      sku: p.sku,
      precoVendaCentavos: p.precoVendaCentavos,
      estoqueMinimo: p.estoqueMinimo,
      saldos,
      saldo,
      abaixoDoMinimo: p.estoqueMinimo > 0 && saldo < p.estoqueMinimo,
    };
  });
}

/** Busca por SKU/código de barras — usada pelo campo de bipagem. */
export async function buscarPorSku(empresaId: string, sku: string) {
  const limpo = sku.trim();
  if (!limpo) return null;
  return db.produtoAcabado.findUnique({
    where: { empresaId_sku: { empresaId, sku: limpo } },
  });
}
