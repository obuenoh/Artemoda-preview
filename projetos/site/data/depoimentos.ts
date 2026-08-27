export type Depoimento = {
  id: string;
  texto: string | null;
  autor: string | null;
  cargo: string | null;
};

/**
 * Tres slots prontos. Nenhum cliente inventado: enquanto `texto` for null,
 * o componente renderiza o slot vazio marcado como pendente.
 */
export const depoimentos: Depoimento[] = [
  { id: 'd1', texto: null, autor: null, cargo: null },
  { id: 'd2', texto: null, autor: null, cargo: null },
  { id: 'd3', texto: null, autor: null, cargo: null },
];
