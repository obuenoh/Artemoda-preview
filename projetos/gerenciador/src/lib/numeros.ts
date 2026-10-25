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

/**
 * Aceita "18,40", "18.40", "1.250,00", "1.250" e "R$ 18,40". Devolve null
 * se nao for numero. Com virgula, ponto e milhar; sem virgula, ponto so e
 * milhar quando vem seguido de 3 digitos ("1.250") — "18.40" e decimal.
 */
export function reaisParaCentavos(entrada: string): number | null {
  let limpo = entrada.replace(/[R$\s]/g, '');
  if (limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.');
  else if (/\.\d{3}(\.|$)/.test(limpo)) limpo = limpo.replace(/\./g, '');
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

export function unidadeCurta(unidade: string): string {
  if (unidade === 'kg') return 'kg';
  if (unidade === 'unidade') return 'un';
  return 'm';
}

export function milFormatado(mil: number, unidade: string): string {
  return `${milParaNumero(mil)} ${unidadeCurta(unidade)}`;
}

/**
 * Quantos metros da 1 kg de um tecido, em milesimos: 1 / (gramatura x largura).
 * Malha de 180 g/m2 com 1,80 m de largura: 3,086 m por kg (3086).
 * Sem largura ou gramatura no cadastro nao da para saber — devolve null.
 */
export function metrosPorKgMil(larguraMil: number | null, gramaturaGm2: number | null): number | null {
  if (!larguraMil || !gramaturaGm2) return null;
  return Math.round(1_000_000_000 / (gramaturaGm2 * larguraMil));
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

// ──────────────────────────────────────────────────────────────────── datas

/**
 * Campo de data ("2026-10-24") vira o MEIO-DIA local daquele dia.
 * `new Date("2026-10-24")` e meia-noite UTC — no Brasil isso ainda e o
 * dia 23, e o vencimento apareceria um dia antes. Meio-dia nao vira de
 * dia em nenhum fuso do pais nem num servidor em UTC.
 */
export function dataDoCampo(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const data = new Date(`${valor}T12:00:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

/** O inverso: Date para o valor de um <input type="date">, no dia local. */
export function campoDeData(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function inicioDoDia(data: Date): Date {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function fimDoDia(data: Date): Date {
  const d = new Date(data);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function somarDias(data: Date, dias: number): Date {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

/** Mesmo dia N meses depois; dia 31 em mes de 30 dias cai no ultimo dia. */
export function somarMeses(data: Date, meses: number): Date {
  const d = new Date(data);
  const dia = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + meses);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo));
  return d;
}

/** Dias de calendario entre hoje e a data (negativo = ja passou). */
export function diasAte(data: Date, hoje = new Date()): number {
  return Math.round((inicioDoDia(data).getTime() - inicioDoDia(hoje).getTime()) / 86_400_000);
}
