export type Etapa = {
  numero: string;
  titulo: string;
  descricao: string;
  selo?: 'interno' | 'parceiros';
};

/** Numeracao aqui nao e enfeite: e sequencia real de producao. */
export const processo: Etapa[] = [
  {
    numero: '01',
    titulo: 'Briefing e modelagem',
    descricao:
      'Entendemos a necessidade, o uso da peça e a grade. A modelagem sai daqui, ajustada ao corpo de quem vai vestir.',
  },
  {
    numero: '02',
    titulo: 'Escolha do tecido',
    descricao:
      'Compramos direto da fábrica. Você escolhe pensando em conforto, durabilidade e no bolso — a gente mostra o que cada opção entrega.',
  },
  {
    numero: '03',
    titulo: 'Corte e costura',
    descricao:
      'Feito na nossa confecção, com a nossa equipe. Sem intermediário, sem terceirizar a peça inteira.',
    selo: 'interno',
  },
  {
    numero: '04',
    titulo: 'Personalização',
    descricao:
      'DTF, silk screen e bordado com parceiros especializados, escolhidos peça a peça conforme o tecido e a arte.',
    selo: 'parceiros',
  },
  {
    numero: '05',
    titulo: 'Controle de qualidade',
    descricao:
      'Peça a peça: costura, acabamento, medidas e aplicação. O que não passa, não sai.',
  },
  {
    numero: '06',
    titulo: 'Entrega',
    descricao:
      'Embalado por tamanho e conferido antes de sair. Entregamos para todo o Brasil.',
  },
];
