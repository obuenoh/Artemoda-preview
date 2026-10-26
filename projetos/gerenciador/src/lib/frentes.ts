/**
 * As tres frentes da Arte e Moda. A empresa e uma so (um CNPJ, um caixa),
 * mas cada frente tem as proprias vendas e o proprio estoque de peca pronta.
 *
 * Tudo e fabricado pela Fabrica: a Loja e o E-commerce recebem peca por
 * envio (src/lib/produtos.ts). Arquivo puro, sem banco: serve ao navegador
 * e ao servidor.
 */

export const FRENTES = {
  fabrica: 'Fábrica',
  loja: 'Loja',
  ecommerce: 'E-commerce',
} as const;

export type Frente = keyof typeof FRENTES;

export const LISTA_FRENTES: Frente[] = ['fabrica', 'loja', 'ecommerce'];

export function ehFrente(valor: unknown): valor is Frente {
  return typeof valor === 'string' && valor in FRENTES;
}

export function rotuloFrente(frente: string | null | undefined): string {
  return ehFrente(frente) ? FRENTES[frente] : '—';
}

/** Como a venda de cada frente aparece no caixa e no extrato. */
export const DESCRICAO_VENDA: Record<Frente, string> = {
  fabrica: 'Pedido da fábrica',
  loja: 'Venda na loja',
  ecommerce: 'Venda no e-commerce',
};

// "a Loja", mas "o E-commerce": a frase muda com o genero da frente.
const ARTIGO: Record<Frente, 'a' | 'o'> = { fabrica: 'a', loja: 'a', ecommerce: 'o' };

/** "na Fábrica", "no E-commerce". */
export function naFrente(frente: Frente): string {
  return `${ARTIGO[frente] === 'a' ? 'na' : 'no'} ${FRENTES[frente]}`;
}

/** "da Fábrica", "do E-commerce". */
export function daFrente(frente: Frente): string {
  return `${ARTIGO[frente] === 'a' ? 'da' : 'do'} ${FRENTES[frente]}`;
}

/** "para a Loja", "para o E-commerce". */
export function paraFrente(frente: Frente): string {
  return `para ${ARTIGO[frente]} ${FRENTES[frente]}`;
}

/** "A Fábrica", "O E-commerce" — para comecar frase. */
export function aFrente(frente: Frente): string {
  return `${ARTIGO[frente].toUpperCase()} ${FRENTES[frente]}`;
}
