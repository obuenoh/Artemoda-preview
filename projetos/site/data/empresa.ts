/**
 * Fonte unica dos dados da empresa. Nada de contato hardcoded em componente.
 */
export const empresa = {
  nome: 'ARTE E MODA',
  nomeSimples: 'Arte e Moda',
  razaoSocial: 'Arte e Moda', // TODO: confirmar razao social completa
  descritor: 'Uniformes • Private Label • Confecção Premium',
  assinaturas: {
    principal: 'Excelência em cada detalhe. Qualidade que veste grandes marcas.',
    secundaria: 'Vestimos propósitos. Fortalecemos marcas.',
  },
  cnpj: '13.124.246/0001-17',
  endereco: {
    logradouro: 'Av. Amador Bueno da Veiga, 2743',
    bairro: 'Penha de França',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '', // TODO: CEP para o schema LocalBusiness e para o mapa
    completo: 'Av. Amador Bueno da Veiga, 2743 — Penha de França, São Paulo — SP',
  },
  regiao: 'São Paulo e região metropolitana',
  contato: {
    whatsapp: '5511947473375',
    whatsappFormatado: '(11) 94747-3375',
    email: 'artemodaunifo@gmail.com',
    instagram: 'arteemoda.br',
    instagramUrl: 'https://instagram.com/arteemoda.br',
  },
  horario: {
    // TODO: confirmar horario real de atendimento
    resumo: 'Segunda a sexta, 8h às 18h',
    schema: ['Mo-Fr 08:00-18:00'],
  },
  producao: {
    pedidoMinimo: 30,
    prazoMedio: '', // TODO: prazo medio real de producao
  },
  site: {
    // TODO: dominio definitivo. Trocar aqui e em NEXT_PUBLIC_SITE_URL.
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://arteemoda.com.br',
  },
} as const;

/** Link de WhatsApp com mensagem pre-preenchida por pagina. */
export function whatsappLink(mensagem: string): string {
  return `https://wa.me/${empresa.contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export const mensagensWhatsapp = {
  home: 'Olá! Vim pelo site da Arte e Moda e gostaria de solicitar um orçamento.',
  escolares:
    'Olá! Vim pelo site e represento uma escola. Gostaria de um orçamento de uniforme escolar.',
  empresariais:
    'Olá! Vim pelo site e preciso de um orçamento de uniforme para a minha empresa.',
  privateLabel:
    'Olá! Vim pelo site e quero produzir a minha marca de roupa com vocês.',
  sobre: 'Olá! Conheci a Arte e Moda pelo site e queria entender melhor como vocês trabalham.',
  contato: 'Olá! Vim pela página de contato do site da Arte e Moda.',
} as const;
