import type { Prisma, PrismaClient } from '@prisma/client';
import { db } from './db';
import { custoUnitario, valorDe } from './numeros';

/**
 * RAZAO DE ESTOQUE — o modulo que garante a regra inegociavel do sistema.
 *
 * Saldo nao e campo. Saldo e a soma dos lancamentos. Nada aqui faz UPDATE
 * em quantidade: correcao vira lancamento novo, com motivo e autor.
 *
 * Toda escrita de estoque no sistema passa por `lancar()`. Se um dia os
 * numeros nao baterem, o extrato explica exatamente onde e por quem.
 */

export type TipoMovimento =
  | 'entrada_compra'
  | 'entrada_inicial'
  | 'saida_producao'
  | 'ajuste_inventario'
  | 'devolucao_fornecedor'
  | 'perda';

export const rotuloMovimento: Record<TipoMovimento, string> = {
  entrada_compra: 'Compra',
  entrada_inicial: 'Estoque inicial',
  saida_producao: 'Saiu para produção',
  ajuste_inventario: 'Ajuste de contagem',
  devolucao_fornecedor: 'Devolvido ao fornecedor',
  perda: 'Perda',
};

type Cliente = PrismaClient | Prisma.TransactionClient;

export type EstadoAtual = {
  saldoMil: number;
  custoMedioCentavos: number;
  ultimoCustoCentavos: number;
  ultimoMovimentoEm: Date | null;
};

/** Le o estado a partir do ultimo lancamento — nunca de um campo de saldo. */
export async function estadoAtual(
  materiaPrimaId: string,
  tx: Cliente = db,
): Promise<EstadoAtual> {
  const ultimo = await tx.movimentoEstoque.findFirst({
    where: { materiaPrimaId },
    orderBy: { criadoEm: 'desc' },
  });

  if (!ultimo) {
    return {
      saldoMil: 0,
      custoMedioCentavos: 0,
      ultimoCustoCentavos: 0,
      ultimoMovimentoEm: null,
    };
  }

  // So COMPRA conta como "ultima compra". Estoque de abertura e ajuste de
  // contagem entram com valor estimado — trata-los como preco de compra
  // faria a coluna mentir justamente onde ela serve para flagrar aumento.
  const ultimaCompra = await tx.movimentoEstoque.findFirst({
    where: { materiaPrimaId, tipo: 'entrada_compra' },
    orderBy: { criadoEm: 'desc' },
  });

  return {
    saldoMil: ultimo.saldoAposMil,
    custoMedioCentavos: ultimo.custoMedioAposCentavos,
    ultimoCustoCentavos: ultimaCompra?.custoUnitarioCentavos ?? 0,
    ultimoMovimentoEm: ultimo.criadoEm,
  };
}

export type Lancamento = {
  empresaId: string;
  materiaPrimaId: string;
  tipo: TipoMovimento;
  /** Com sinal: positivo entra, negativo sai. */
  quantidadeMil: number;
  /** Obrigatorio nas entradas. Nas saidas o sistema usa o custo medio. */
  custoUnitarioCentavos?: number;
  origemTipo?: string;
  origemId?: string;
  motivo?: string;
  usuarioId?: string;
};

/**
 * Custo medio ponderado, recalculado a cada ENTRADA:
 *
 *   novo_medio = (saldo x medio_atual + entrada x custo_entrada)
 *                ────────────────────────────────────────────────
 *                          saldo + entrada
 *
 * Saida nao mexe no custo medio — sai valorizada pelo medio vigente.
 */
export async function lancar(mov: Lancamento, tx: Cliente = db) {
  if (mov.quantidadeMil === 0) {
    throw new Error('Lançamento de estoque com quantidade zero não faz sentido.');
  }

  const estado = await estadoAtual(mov.materiaPrimaId, tx);
  const entrada = mov.quantidadeMil > 0;

  let custoMedio = estado.custoMedioCentavos;
  let custoDoLancamento = mov.custoUnitarioCentavos ?? estado.custoMedioCentavos;

  if (entrada) {
    if (mov.custoUnitarioCentavos === undefined) {
      throw new Error('Entrada de estoque precisa do custo unitário.');
    }
    const saldoNovo = estado.saldoMil + mov.quantidadeMil;
    const valorAtual = valorDe(Math.max(estado.saldoMil, 0), estado.custoMedioCentavos);
    const valorEntrada = valorDe(mov.quantidadeMil, mov.custoUnitarioCentavos);
    custoMedio = saldoNovo > 0 ? custoUnitario(valorAtual + valorEntrada, saldoNovo) : 0;
    custoDoLancamento = mov.custoUnitarioCentavos;
  }

  const saldoApos = estado.saldoMil + mov.quantidadeMil;

  return tx.movimentoEstoque.create({
    data: {
      empresaId: mov.empresaId,
      materiaPrimaId: mov.materiaPrimaId,
      tipo: mov.tipo,
      quantidadeMil: mov.quantidadeMil,
      custoUnitarioCentavos: custoDoLancamento,
      custoMedioAposCentavos: custoMedio,
      saldoAposMil: saldoApos,
      origemTipo: mov.origemTipo,
      origemId: mov.origemId,
      motivo: mov.motivo,
      usuarioId: mov.usuarioId,
    },
  });
}

export type LinhaEstoque = {
  id: string;
  nome: string;
  cor: string | null;
  unidade: string;
  localizacao: string | null;
  estoqueMinimoMil: number;
  saldoMil: number;
  custoMedioCentavos: number;
  ultimoCustoCentavos: number;
  valorCentavos: number;
  diasParado: number | null;
  abaixoDoMinimo: boolean;
  variacaoPct: number | null;
};

/** Posicao de estoque de todos os tecidos, derivada do razao. */
export async function posicaoEstoque(empresaId: string): Promise<LinhaEstoque[]> {
  const materias = await db.materiaPrima.findMany({
    where: { empresaId, ativo: true },
    orderBy: { nome: 'asc' },
  });

  const linhas: LinhaEstoque[] = [];

  for (const mp of materias) {
    const estado = await estadoAtual(mp.id);
    const valor = valorDe(Math.max(estado.saldoMil, 0), estado.custoMedioCentavos);

    const variacao =
      estado.custoMedioCentavos > 0 && estado.ultimoCustoCentavos > 0
        ? Math.round(
            ((estado.ultimoCustoCentavos - estado.custoMedioCentavos) /
              estado.custoMedioCentavos) *
              100,
          )
        : null;

    linhas.push({
      id: mp.id,
      nome: mp.nome,
      cor: mp.cor,
      unidade: mp.unidade,
      localizacao: mp.localizacao,
      estoqueMinimoMil: mp.estoqueMinimoMil,
      saldoMil: estado.saldoMil,
      custoMedioCentavos: estado.custoMedioCentavos,
      ultimoCustoCentavos: estado.ultimoCustoCentavos,
      valorCentavos: valor,
      diasParado: estado.ultimoMovimentoEm
        ? Math.floor((Date.now() - estado.ultimoMovimentoEm.getTime()) / 86_400_000)
        : null,
      abaixoDoMinimo: mp.estoqueMinimoMil > 0 && estado.saldoMil < mp.estoqueMinimoMil,
      variacaoPct: variacao,
    });
  }

  return linhas;
}
