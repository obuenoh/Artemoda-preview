import type { IconName } from '@/components/icons/AtelierIcons';

export type Diferencial = {
  titulo: string;
  descricao: string;
  icone: IconName;
};

/** Icones do vocabulario de atelie — nenhum caminhao, nenhuma medalha. */
export const diferenciais: Diferencial[] = [
  {
    titulo: 'Qualidade premium',
    descricao:
      'Tecido comprado direto da fábrica e acabamento conferido peça a peça antes de sair.',
    icone: 'dedal',
  },
  {
    titulo: 'Fabricação própria',
    descricao:
      'Corte e costura acontecem na nossa confecção. Não somos revenda nem intermediário.',
    icone: 'agulha',
  },
  {
    titulo: 'Atendimento personalizado',
    descricao:
      'Cada pedido tem modelagem, grade e prazo tratados no detalhe — não existe pedido padrão.',
    icone: 'fita',
  },
  {
    titulo: 'Entrega para todo o Brasil',
    descricao:
      'Produção em São Paulo, envio para qualquer cidade, embalado e separado por tamanho.',
    icone: 'brasil',
  },
  {
    titulo: 'Parcerias de confiança',
    descricao:
      'DTF, silk e bordado com parceiros especializados que já trabalham com a gente há anos.',
    icone: 'travete',
  },
  {
    titulo: 'Compromisso e excelência',
    descricao:
      'Prazo combinado é prazo cumprido. É o que mantém escola e empresa voltando todo ano.',
    icone: 'etiqueta',
  },
];
