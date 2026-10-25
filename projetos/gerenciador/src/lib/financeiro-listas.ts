import { somarDias } from './numeros';

/**
 * Listas e contas puras do financeiro, sem banco: podem ir para o navegador
 * (formularios) e para o servidor. O resto mora em lib/financeiro.ts.
 */

// ─────────────────────────────────────────────────────────── listas fixas

/** Para onde o dinheiro vai. Texto no banco: a lista pode crescer sem migracao. */
export const CATEGORIAS_SAIDA = {
  tecido_aviamento: 'Tecido e aviamento',
  servico: 'Serviço de terceiro (DTF, silk, bordado)',
  pessoal: 'Salários e pessoal',
  aluguel: 'Aluguel',
  consumo: 'Luz, água, internet e telefone',
  imposto: 'Impostos e taxas',
  manutencao: 'Manutenção de máquinas',
  frete: 'Frete e entrega',
  divulgacao: 'Anúncios e divulgação',
  retirada: 'Retirada da dona',
  outro: 'Outra despesa',
} as const;

/** De onde vem o dinheiro que nao e venda bipada no balcao. */
export const CATEGORIAS_ENTRADA = {
  sinal: 'Sinal de pedido',
  recebimento: 'Recebimento de cliente',
  aporte: 'Dinheiro que a dona colocou',
  outro: 'Outra entrada',
} as const;

export const FORMAS_PAGAMENTO = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
  cartao: 'Cartão',
  transferencia: 'Transferência',
} as const;

export type CategoriaSaida = keyof typeof CATEGORIAS_SAIDA;
export type CategoriaEntrada = keyof typeof CATEGORIAS_ENTRADA;

const rotulosOrigem: Record<string, string> = {
  venda: 'Venda',
  abertura: 'Saldo de abertura',
  ajuste: 'Conferência do caixa',
  estorno: 'Estorno',
};

export function rotuloCategoria(lancamento: { categoria: string | null; origemTipo: string | null }): string {
  const c = lancamento.categoria;
  if (c && c in CATEGORIAS_SAIDA) return CATEGORIAS_SAIDA[c as CategoriaSaida];
  if (c && c in CATEGORIAS_ENTRADA) return CATEGORIAS_ENTRADA[c as CategoriaEntrada];
  return rotulosOrigem[lancamento.origemTipo ?? ''] ?? '—';
}

export function rotuloForma(forma: string | null | undefined): string {
  if (!forma) return '';
  return FORMAS_PAGAMENTO[forma as keyof typeof FORMAS_PAGAMENTO] ?? forma;
}

// ──────────────────────────────────────────────────── parcelas e prazos

/** Divide um total em N parcelas inteiras; os centavos que sobram vao na primeira. */
export function dividirEmParcelas(totalCentavos: number, n: number): number[] {
  const base = Math.floor(totalCentavos / n);
  const sobra = totalCentavos - base * n;
  return Array.from({ length: n }, (_, i) => (i === 0 ? base + sobra : base));
}

/** Dias de prazo de cada parcela, pela condicao cadastrada no fornecedor ou cliente. */
export function prazosDaCondicao(condicao: string): number[] {
  if (condicao === 'a_vista') return [0];
  if (condicao === '30_60') return [30, 60];
  return [30];
}

export function rotuloCondicao(condicao: string): string {
  if (condicao === 'a_vista') return 'à vista';
  if (condicao === '30_60') return '30/60 dias';
  return '30 dias';
}

/** Vencimento e valor de cada parcela, a partir do dia da compra ou da venda. */
export function parcelasDaCondicao(
  condicao: string,
  base: Date,
  totalCentavos: number,
): { vencimento: Date; valorCentavos: number }[] {
  const prazos = prazosDaCondicao(condicao);
  const valores = dividirEmParcelas(totalCentavos, prazos.length);
  return prazos.map((dias, i) => {
    const vencimento = somarDias(base, dias);
    vencimento.setHours(12, 0, 0, 0);
    return { vencimento, valorCentavos: valores[i] };
  });
}
