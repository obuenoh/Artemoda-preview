import { centavosNumero, dataCurtaBR, diasAte, campoDeData } from '@/lib/numeros';
import { faixaDeVencimento, rotuloForma, type Faixa } from '@/lib/financeiro';
import type { DadosLinha } from './LinhaConta';

/** Texto de prazo que se le de relance: "venceu há 3 dias", "vence amanhã". */
export function quandoVence(vencimento: Date): string {
  const dias = diasAte(vencimento);
  if (dias < -1) return `venceu há ${-dias} dias`;
  if (dias === -1) return 'venceu ontem';
  if (dias === 0) return 'vence hoje';
  if (dias === 1) return 'vence amanhã';
  if (dias <= 7) return `vence ${dataCurtaBR(vencimento)} · em ${dias} dias`;
  return `vence ${dataCurtaBR(vencimento)}`;
}

export function parcelaTexto(c: { parcela: number; totalParcelas: number; fixaMensal?: boolean }): string {
  if (c.fixaMensal) return 'todo mês';
  return c.totalParcelas > 1 ? `parcela ${c.parcela} de ${c.totalParcelas}` : '';
}

type ContaBase = {
  id: string;
  descricao: string;
  valorCentavos: number;
  vencimento: Date;
};

export function linhaAberta(conta: ContaBase, detalhes: string[]): DadosLinha {
  const faixa = faixaDeVencimento(conta.vencimento);
  return {
    id: conta.id,
    descricao: conta.descricao,
    detalhes: detalhes.filter(Boolean).join(' · '),
    quando: quandoVence(conta.vencimento),
    urgente: faixa === 'vencida' || faixa === 'hoje',
    valorCentavos: conta.valorCentavos,
    valorCampo: centavosNumero(conta.valorCentavos),
    hoje: campoDeData(new Date()),
    fechada: false,
  };
}

export function linhaFechada(
  conta: ContaBase & { quitadaEm: Date | null; valorQuitadoCentavos: number | null; formaPagamento: string | null },
  verbo: 'pago' | 'recebido',
  detalhes: string[],
): DadosLinha {
  const forma = rotuloForma(conta.formaPagamento);
  return {
    id: conta.id,
    descricao: conta.descricao,
    detalhes: detalhes.filter(Boolean).join(' · '),
    quando: `${verbo} em ${conta.quitadaEm ? dataCurtaBR(conta.quitadaEm) : '—'}${forma ? ` · ${forma}` : ''}`,
    urgente: false,
    valorCentavos: conta.valorQuitadoCentavos ?? conta.valorCentavos,
    valorCampo: '',
    hoje: campoDeData(new Date()),
    fechada: true,
  };
}

export const tituloFaixa: Record<Faixa, string> = {
  vencida: 'Vencidas',
  hoje: 'Vencem hoje',
  semana: 'Próximos 7 dias',
  depois: 'Mais para frente',
};

/** Agrupa na ordem de urgencia. Conta fixa mensal mostra so o proximo mes em aberto. */
export function agruparPorUrgencia<T extends { vencimento: Date; grupoId: string | null; fixaMensal?: boolean }>(
  contas: T[],
): { faixa: Faixa; contas: T[] }[] {
  const vistos = new Set<string>();
  const visiveis = contas.filter((c) => {
    if (!c.fixaMensal || !c.grupoId) return true;
    if (vistos.has(c.grupoId)) return false;
    vistos.add(c.grupoId);
    return true;
  });

  const ordem: Faixa[] = ['vencida', 'hoje', 'semana', 'depois'];
  return ordem
    .map((faixa) => ({ faixa, contas: visiveis.filter((c) => faixaDeVencimento(c.vencimento) === faixa) }))
    .filter((g) => g.contas.length > 0);
}
