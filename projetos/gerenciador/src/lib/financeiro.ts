import type { Prisma, PrismaClient } from '@prisma/client';
import { db } from './db';
import { inicioDoDia, fimDoDia, somarDias, campoDeData } from './numeros';
import { rotuloCategoria } from './financeiro-listas';
import { LISTA_FRENTES, rotuloFrente, type Frente } from './frentes';

/**
 * FINANCEIRO: caixa, contas a pagar e contas a receber.
 *
 * Mesmo principio do estoque: o saldo do caixa NAO e campo, e a soma dos
 * lancamentos. Toda escrita no caixa passa por lancarCaixa() — nenhuma tela
 * cria LancamentoCaixa direto. Conta a pagar/receber so guarda a situacao;
 * quem mexe no dinheiro e o lancamento criado ao pagar ou receber.
 */

type Cliente = PrismaClient | Prisma.TransactionClient;

export * from './financeiro-listas';

// ─────────────────────────────────────────────────────────────── escrita

export type LancamentoCaixaNovo = {
  empresaId: string;
  tipo: 'entrada' | 'saida';
  valorCentavos: number;
  descricao: string;
  categoria?: string | null;
  origemTipo: 'venda' | 'conta_pagar' | 'conta_receber' | 'manual' | 'abertura' | 'ajuste' | 'estorno';
  origemId?: string | null;
  /** De qual frente veio o dinheiro (venda e recebimento de venda). */
  frente?: Frente | null;
  data?: Date;
  usuarioId?: string | null;
};

/** A unica porta de escrita do caixa. Valor sempre inteiro e positivo. */
export async function lancarCaixa(dados: LancamentoCaixaNovo, tx: Cliente = db) {
  if (!Number.isInteger(dados.valorCentavos) || dados.valorCentavos <= 0) {
    throw new Error('Lançamento de caixa precisa de valor maior que zero.');
  }
  return tx.lancamentoCaixa.create({
    data: {
      empresaId: dados.empresaId,
      tipo: dados.tipo,
      valorCentavos: dados.valorCentavos,
      descricao: dados.descricao,
      categoria: dados.categoria ?? null,
      origemTipo: dados.origemTipo,
      origemId: dados.origemId ?? null,
      frente: dados.frente ?? null,
      data: dados.data ?? new Date(),
      usuarioId: dados.usuarioId ?? null,
    },
  });
}

// ─────────────────────────────────────────────────────────────── leitura

/** Saldo = entradas menos saidas. Com `antesDe`, so o que aconteceu antes dessa data. */
export async function saldoCaixa(empresaId: string, antesDe?: Date): Promise<number> {
  const grupos = await db.lancamentoCaixa.groupBy({
    by: ['tipo'],
    where: { empresaId, ...(antesDe ? { data: { lt: antesDe } } : {}) },
    _sum: { valorCentavos: true },
  });
  const soma = (tipo: string) => grupos.find((g) => g.tipo === tipo)?._sum.valorCentavos ?? 0;
  return soma('entrada') - soma('saida');
}

/**
 * Ja informou quanto a empresa tinha? Olha a auditoria, nao o lancamento:
 * se o valor informado bate com o que o sistema ja somava, a abertura nao
 * gera lancamento nenhum — mas aconteceu.
 */
export async function temAbertura(empresaId: string): Promise<boolean> {
  const n = await db.auditoria.count({ where: { empresaId, entidade: 'caixa', acao: 'abriu' } });
  return n > 0;
}

export type LinhaExtrato = {
  id: string;
  data: Date;
  descricao: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  valorCentavos: number;
  saldoAposCentavos: number;
  /** Quantas vendas do mesmo dia esta linha junta (so em linha de venda). */
  vendas?: number;
  baseVenda?: string;
};

export type Extrato = {
  saldoInicialCentavos: number;
  saldoFinalCentavos: number;
  entradasCentavos: number;
  saidasCentavos: number;
  /** Mais recente primeiro, que e como ela le. */
  linhas: LinhaExtrato[];
  saidasPorCategoria: { categoria: string; totalCentavos: number }[];
  /** Quanto entrou de cada frente (venda e recebimento de venda) e o resto. */
  entradasPorFrente: { frente: string; totalCentavos: number }[];
};

/**
 * Extrato de um periodo com o saldo depois de cada linha. O saldo e
 * recalculado na leitura (nao congelado) porque pagamento pode ser lancado
 * com data passada — um saldo gravado ficaria errado na hora.
 */
export async function extrato(empresaId: string, inicio: Date, fim: Date): Promise<Extrato> {
  const [saldoInicialCentavos, lancamentos] = await Promise.all([
    saldoCaixa(empresaId, inicio),
    db.lancamentoCaixa.findMany({
      where: { empresaId, data: { gte: inicio, lte: fim } },
      orderBy: [{ data: 'asc' }, { criadoEm: 'asc' }],
    }),
  ]);

  let saldo = saldoInicialCentavos;
  let entradas = 0;
  let saidas = 0;
  const porCategoria = new Map<string, number>();
  const porFrente = new Map<string, number>();
  const linhas: LinhaExtrato[] = [];

  for (const l of lancamentos) {
    const sinal = l.tipo === 'entrada' ? 1 : -1;
    saldo += sinal * l.valorCentavos;
    const frente = l.frente ? rotuloFrente(l.frente) : null;
    const categoria = frente ? `${rotuloCategoria(l)} · ${frente}` : rotuloCategoria(l);
    if (l.tipo === 'entrada') {
      entradas += l.valorCentavos;
      const chave = frente ?? 'Outras entradas';
      porFrente.set(chave, (porFrente.get(chave) ?? 0) + l.valorCentavos);
    } else {
      saidas += l.valorCentavos;
      porCategoria.set(categoria, (porCategoria.get(categoria) ?? 0) + l.valorCentavos);
    }

    // Venda bipada no balcao vira uma linha por dia, nao uma por venda:
    // o extrato e para achar conta paga e sinal, nao para recontar o balcao.
    const anterior = linhas.at(-1);
    if (
      l.origemTipo === 'venda' &&
      anterior?.vendas &&
      anterior.baseVenda === l.descricao &&
      campoDeData(anterior.data) === campoDeData(l.data)
    ) {
      anterior.vendas += 1;
      anterior.valorCentavos += l.valorCentavos;
      anterior.saldoAposCentavos = saldo;
      anterior.descricao = `${l.descricao} · ${anterior.vendas} vendas`;
      continue;
    }

    linhas.push({
      id: l.id,
      data: l.data,
      descricao: l.descricao,
      categoria,
      tipo: l.tipo as 'entrada' | 'saida',
      valorCentavos: l.valorCentavos,
      saldoAposCentavos: saldo,
      vendas: l.origemTipo === 'venda' ? 1 : undefined,
      baseVenda: l.origemTipo === 'venda' ? l.descricao : undefined,
    });
  }

  return {
    saldoInicialCentavos,
    saldoFinalCentavos: saldo,
    entradasCentavos: entradas,
    saidasCentavos: saidas,
    linhas: linhas.reverse(),
    saidasPorCategoria: [...porCategoria.entries()]
      .map(([categoria, totalCentavos]) => ({ categoria, totalCentavos }))
      .sort((a, b) => b.totalCentavos - a.totalCentavos),
    // Ordem fixa: as tres frentes primeiro (mesmo zeradas), o resto no fim.
    entradasPorFrente: [...LISTA_FRENTES.map((f) => rotuloFrente(f)), 'Outras entradas']
      .map((frente) => ({ frente, totalCentavos: porFrente.get(frente) ?? 0 }))
      .filter((e, i) => i < LISTA_FRENTES.length || e.totalCentavos > 0),
  };
}

// ────────────────────────────────────────────────────── urgencia e previsao

export type Faixa = 'vencida' | 'hoje' | 'semana' | 'depois';

/** O que exige acao primeiro: vencida, vence hoje, nos proximos 7 dias, depois. */
export function faixaDeVencimento(vencimento: Date, agora = new Date()): Faixa {
  const hoje = inicioDoDia(agora);
  if (vencimento < hoje) return 'vencida';
  if (vencimento <= fimDoDia(agora)) return 'hoje';
  if (vencimento <= fimDoDia(somarDias(agora, 7))) return 'semana';
  return 'depois';
}

export type SemanaPrevista = {
  inicio: Date;
  fim: Date;
  entraCentavos: number;
  saiCentavos: number;
  saldoFimCentavos: number;
};

export type Previsao = {
  saldoHojeCentavos: number;
  semanas: SemanaPrevista[];
  /** Primeiro dia em que o saldo previsto fica abaixo de zero, se ficar. */
  primeiroNegativo: { dia: Date; saldoCentavos: number } | null;
};

/**
 * Saldo de hoje mais o que vence nas proximas semanas. Conta atrasada entra
 * como se fosse hoje: ela ainda vai sair (ou entrar) e precisa pesar agora.
 */
export async function previsao(empresaId: string, semanas = 5): Promise<Previsao> {
  const agora = new Date();
  const hoje = inicioDoDia(agora);
  const limite = fimDoDia(somarDias(hoje, semanas * 7 - 1));

  const [saldoHojeCentavos, pagar, receber] = await Promise.all([
    saldoCaixa(empresaId),
    db.contaPagar.findMany({
      where: { empresaId, situacao: 'aberta', vencimento: { lte: limite } },
      select: { vencimento: true, valorCentavos: true },
    }),
    db.contaReceber.findMany({
      where: { empresaId, situacao: 'aberta', vencimento: { lte: limite } },
      select: { vencimento: true, valorCentavos: true },
    }),
  ]);

  // Entra e sai previstos por dia (chave local), atrasado contando como hoje.
  // Separados: somados num numero so, o que entra some dentro do que sai.
  const entraPorDia = new Map<string, number>();
  const saiPorDia = new Map<string, number>();
  const somar = (mapa: Map<string, number>, data: Date, valor: number) => {
    const chave = campoDeData(data < hoje ? hoje : data);
    mapa.set(chave, (mapa.get(chave) ?? 0) + valor);
  };
  for (const c of pagar) somar(saiPorDia, c.vencimento, c.valorCentavos);
  for (const c of receber) somar(entraPorDia, c.vencimento, c.valorCentavos);

  const lista: SemanaPrevista[] = [];
  let saldo = saldoHojeCentavos;
  let primeiroNegativo: Previsao['primeiroNegativo'] = null;

  for (let s = 0; s < semanas; s++) {
    const inicio = somarDias(hoje, s * 7);
    const fim = fimDoDia(somarDias(inicio, 6));
    let entra = 0;
    let sai = 0;
    for (let d = 0; d < 7; d++) {
      const dia = somarDias(inicio, d);
      const chave = campoDeData(dia);
      const entraDia = entraPorDia.get(chave) ?? 0;
      const saiDia = saiPorDia.get(chave) ?? 0;
      entra += entraDia;
      sai += saiDia;
      saldo += entraDia - saiDia;
      if (saldo < 0 && !primeiroNegativo) primeiroNegativo = { dia, saldoCentavos: saldo };
    }
    lista.push({ inicio, fim, entraCentavos: entra, saiCentavos: sai, saldoFimCentavos: saldo });
  }

  return { saldoHojeCentavos, semanas: lista, primeiroNegativo };
}

export type Pendencias = {
  saldoCentavos: number;
  pagarVencidas: { quantidade: number; totalCentavos: number };
  pagarSeteDias: { quantidade: number; totalCentavos: number };
  receberAtrasadas: { quantidade: number; totalCentavos: number };
};

/** O resumo que a Visao Geral mostra para a dona. */
export async function pendenciasFinanceiras(empresaId: string): Promise<Pendencias> {
  const agora = new Date();
  const hoje = inicioDoDia(agora);
  const em7 = fimDoDia(somarDias(agora, 7));

  const [saldoCentavos, vencidas, proximas, atrasadas] = await Promise.all([
    saldoCaixa(empresaId),
    db.contaPagar.aggregate({
      where: { empresaId, situacao: 'aberta', vencimento: { lt: hoje } },
      _count: true,
      _sum: { valorCentavos: true },
    }),
    db.contaPagar.aggregate({
      where: { empresaId, situacao: 'aberta', vencimento: { gte: hoje, lte: em7 } },
      _count: true,
      _sum: { valorCentavos: true },
    }),
    db.contaReceber.aggregate({
      where: { empresaId, situacao: 'aberta', vencimento: { lt: hoje } },
      _count: true,
      _sum: { valorCentavos: true },
    }),
  ]);

  return {
    saldoCentavos,
    pagarVencidas: { quantidade: vencidas._count, totalCentavos: vencidas._sum.valorCentavos ?? 0 },
    pagarSeteDias: { quantidade: proximas._count, totalCentavos: proximas._sum.valorCentavos ?? 0 },
    receberAtrasadas: { quantidade: atrasadas._count, totalCentavos: atrasadas._sum.valorCentavos ?? 0 },
  };
}
