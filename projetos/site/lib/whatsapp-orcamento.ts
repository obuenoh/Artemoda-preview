import { empresa } from '@/data/empresa';

export type DadosOrcamento = {
  tipo: string;
  quantidade: string;
  prazo: string;
  personalizacao: string[];
  nome: string;
  organizacao: string;
  whatsapp: string;
  email: string;
  cidade: string;
  mensagem?: string;
};

/**
 * Monta o texto estruturado do orçamento para ser enviado via WhatsApp.
 * Usa formatação nativa do WhatsApp (*negrito*, marcadores, quebras limpas).
 */
export function gerarMensagemOrcamento(
  dados: Partial<DadosOrcamento>,
  temArquivo = false,
): string {
  const personalizacoesStr =
    dados.personalizacao && dados.personalizacao.length > 0
      ? dados.personalizacao.join(', ')
      : 'Não definido';

  const linhas: string[] = [
    'Olá, Arte e Moda! Gostaria de um orçamento pelo site:',
    '',
    '📋 *DETALHES DO PEDIDO*',
    `• *Tipo:* ${dados.tipo || 'A definir'}`,
    `• *Quantidade:* ${dados.quantidade || 'A definir'}`,
    `• *Prazo desejado:* ${dados.prazo || 'A definir'}`,
    `• *Personalização:* ${personalizacoesStr}`,
    '',
    '👤 *DADOS PARA CONTATO*',
    `• *Nome:* ${dados.nome || 'Não informado'}`,
    `• *Empresa / Escola / Marca:* ${dados.organizacao || 'Não informada'}`,
    `• *WhatsApp:* ${dados.whatsapp || 'Não informado'}`,
    `• *E-mail:* ${dados.email || 'Não informado'}`,
    `• *Cidade:* ${dados.cidade || 'Não informada'}`,
  ];

  if (dados.mensagem && dados.mensagem.trim().length > 0) {
    linhas.push('', '💬 *OBSERVAÇÕES ADICIONAIS*', dados.mensagem.trim());
  }

  if (temArquivo) {
    linhas.push(
      '',
      '📎 *(Selecionei um arquivo de arte/referência no site para enviar aqui no chat)*',
    );
  }

  return linhas.join('\n');
}

/**
 * Cria a URL universal do WhatsApp (wa.me) com a mensagem formatada codificada.
 */
export function criarLinkWhatsappOrcamento(
  dados: Partial<DadosOrcamento>,
  temArquivo = false,
): string {
  const mensagem = gerarMensagemOrcamento(dados, temArquivo);
  return `https://wa.me/${empresa.contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
