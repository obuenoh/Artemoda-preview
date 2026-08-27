export type FaqItem = { pergunta: string; resposta: string };

/**
 * Respostas escritas sem inventar numero. Onde falta dado real da operacao,
 * a resposta e honesta ("confirmamos no orcamento") e o TODO fica registrado
 * em PENDENCIAS.md para virar resposta definitiva.
 */
export const faq: FaqItem[] = [
  {
    pergunta: 'Qual a quantidade mínima por pedido?',
    resposta:
      'Trabalhamos a partir de 30 peças. Abaixo disso o custo de modelagem e preparação de máquina inviabiliza o preço — mas fale com a gente, porque dependendo do modelo dá para conversar.',
  },
  {
    pergunta: 'Qual o prazo de produção?',
    resposta:
      // TODO: substituir pelo prazo medio real quando a operacao medir.
      'Depende da quantidade, do tipo de tecido e da personalização escolhida. Fechamos o prazo junto com o orçamento e ele vira compromisso — não estimativa. Para uniforme escolar, o ideal é começar com folga antes da volta às aulas.',
  },
  {
    pergunta: 'Como envio a minha arte?',
    resposta:
      'Você anexa direto no formulário de orçamento ou manda no WhatsApp. Aceitamos PDF, AI, EPS, SVG e PNG em alta. Se você só tem a logo em foto, a gente avalia e diz o que dá para fazer.',
  },
  {
    pergunta: 'Que tipos de personalização vocês fazem?',
    resposta:
      'DTF, silk screen e bordado, com parceiros especializados em cada técnica. A escolha não é sua sozinha: a gente indica o que se comporta melhor no tecido e no uso da peça — bordado em polo de empresa, DTF em arte colorida, silk em volume grande.',
  },
  {
    pergunta: 'Quais tecidos vocês trabalham?',
    resposta:
      // TODO: listar a carta de tecidos que a confeccao realmente mantem.
      'Compramos tecido direto de fábrica e escolhemos junto com você conforme o uso: uniforme escolar pede resistência a lavagem, uniforme corporativo pede caimento, streetwear pede gramatura. Apresentamos as opções com amostra antes de fechar.',
  },
  {
    pergunta: 'Vocês entregam fora de São Paulo?',
    resposta:
      'Sim, entregamos para todo o Brasil. A produção é aqui na Penha de França, em São Paulo, e o envio sai embalado e separado por tamanho para facilitar a distribuição na escola ou na empresa.',
  },
  {
    pergunta: 'Como funciona o pagamento?',
    resposta:
      // TODO: condicoes reais de pagamento (entrada, parcelamento, faturamento).
      'As condições são definidas no orçamento, conforme o volume e o prazo do pedido. Atendemos escola e empresa com nota fiscal e a documentação que o setor de compras precisar.',
  },
];
