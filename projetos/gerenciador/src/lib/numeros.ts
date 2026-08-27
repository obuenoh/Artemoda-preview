/**
 * Dinheiro em CENTAVOS inteiros. Quantidade em MILESIMOS inteiros.
 * Nenhum float entra nesses caminhos — 0.1 + 0.2 nao pode virar prejuizo.
 */

// ───────────────────────────────────────────────────────────────── dinheiro

export function centavosParaReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Sem o "R$" — para tabelas onde a coluna ja diz que e dinheiro. */
export function centavosNumero(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Aceita "18,40", "18.40", "R$ 18,40". Devolve null se nao for numero. */
export function reaisParaCentavos(entrada: string): number | null {
  const limpo = entrada.replace(/[R$\s.]/g, '').replace(',', '.');
  if (limpo === '' || !/^-?\d*\.?\d*$/.test(limpo)) return null;
  const n = Number(limpo);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

// ─────────────────────────────────────────────────────────────── quantidade

export function milParaNumero(mil: number, casas = 2): string {
  return (mil / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function milFormatado(mil: number, unidade: string): string {
  return `${milParaNumero(mil)} ${unidade === 'kg' ? 'kg' : 'm'}`;
}

export function numeroParaMil(entrada: string): number | null {
  const limpo = entrada.replace(/\s/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  if (limpo === '' || !/^-?\d*\.?\d*$/.test(limpo)) return null;
  const n = Number(limpo);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 1000);
}

/**
 * Custo unitario a partir de um total e uma quantidade, ambos inteiros.
 * Devolve centavos por UNIDADE (metro ou kg), arredondado.
 */
export function custoUnitario(totalCentavos: number, quantidadeMil: number): number {
  if (quantidadeMil === 0) return 0;
  return Math.round((totalCentavos * 1000) / quantidadeMil);
}

/** Valor de uma quantidade a um dado custo unitario. */
export function valorDe(quantidadeMil: number, custoUnitarioCentavos: number): number {
  return Math.round((quantidadeMil * custoUnitarioCentavos) / 1000);
}

export function diasDesde(data: Date): number {
  const ms = Date.now() - data.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function dataBR(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function dataCurtaBR(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
