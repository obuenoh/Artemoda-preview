export type ItemGaleria = {
  id: string;
  /** Descricao do que entra aqui. Vira alt text quando a foto chegar. */
  descricao: string;
  proporcao: '3:2' | '4:5' | '1:1';
  /** Quando a foto chegar, apontar para /public. Ate la, placeholder da paleta. */
  src?: string;
};

/**
 * Nao ha fotos reais ainda. Trocar `src` aqui e o site inteiro atualiza —
 * nenhum componente precisa ser tocado.
 */
export const galeria: ItemGaleria[] = [
  { id: 'g1', descricao: 'Chão de fábrica — mesa de corte', proporcao: '3:2' },
  { id: 'g2', descricao: 'Kit de uniforme escolar completo', proporcao: '3:2' },
  { id: 'g3', descricao: 'Detalhe de bordado em polo corporativa', proporcao: '3:2' },
  { id: 'g4', descricao: 'Peças de streetwear produzidas em private label', proporcao: '3:2' },
  { id: 'g5', descricao: 'Costura em máquina reta — equipe trabalhando', proporcao: '3:2' },
  { id: 'g6', descricao: 'Etiqueta e acabamento interno da peça', proporcao: '3:2' },
];
