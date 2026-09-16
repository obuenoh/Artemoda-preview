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
  {
    id: 'g1',
    descricao: 'Chão de fábrica — mesa de corte industrial',
    proporcao: '3:2',
    src: '/images/fabrica-mesa-corte.jpg',
  },
  {
    id: 'g2',
    descricao: 'Linha de costura e montagem — equipe em operação',
    proporcao: '3:2',
    src: '/images/fabrica-linha-costura.jpg',
  },
  {
    id: 'g3',
    descricao: 'Bordado industrial Tajima de alta definição',
    proporcao: '3:2',
    src: '/images/fabrica-bordado-industrial.jpg',
  },
  {
    id: 'g4',
    descricao: 'Estamparia e aplicação de estampa DTF em prensa térmica',
    proporcao: '3:2',
    src: '/images/fabrica-estamparia-dtf.jpg',
  },
  {
    id: 'g5',
    descricao: 'Revisão de qualidade, costura e acabamento a vapor',
    proporcao: '3:2',
    src: '/images/fabrica-revisao-acabamento.jpg',
  },
  {
    id: 'g6',
    descricao: 'Lotes de peças finalizadas e prontas para expedição',
    proporcao: '3:2',
    src: '/images/fabrica-pecas-expedicao.jpg',
  },
];
