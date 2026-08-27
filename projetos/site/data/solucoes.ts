export type Solucao = {
  slug: string;
  frente: string;
  titulo: string;
  descricao: string;
  /** Micro-label no rodape do card, tipografia de etiqueta de composicao. */
  etiqueta: string[];
  href: string;
  icone: 'agulha' | 'tesoura' | 'tecido';
};

export const solucoes: Solucao[] = [
  {
    slug: 'uniformes',
    frente: 'Arte e Moda Uniformes',
    titulo: 'Uniformes',
    descricao:
      'Kits completos para escolas e uniformes corporativos para empresas. Modelagem própria, grade fechada e reposição durante o ano.',
    etiqueta: ['Escolas', 'Empresas', 'Grade 2–16'],
    href: '/uniformes-escolares',
    icone: 'agulha',
  },
  {
    slug: 'studio',
    frente: 'Arte e Moda Studio',
    titulo: 'Studio',
    descricao:
      'Private label e streetwear para marcas que querem produzir a própria linha. Do piloto à grade completa, com a costura feita aqui dentro.',
    etiqueta: ['Private label', 'Streetwear'],
    href: '/private-label',
    icone: 'tesoura',
  },
  {
    slug: 'casual',
    frente: 'Arte e Moda Casual',
    titulo: 'Casual',
    descricao:
      'Moda casual da própria marca, com as mesmas máquinas e o mesmo controle de qualidade que atendem escolas e empresas.',
    etiqueta: ['Moda casual', 'Marca própria'],
    href: '/sobre',
    icone: 'tecido',
  },
];
