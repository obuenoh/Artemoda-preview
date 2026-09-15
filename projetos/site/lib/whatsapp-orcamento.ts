import { empresa } from '@/data/empresa';

export type DadosOrcamento = {
  tipo: string;
  tipoOutro?: string;
  quantidade: string;
  prazo?: string;
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
  nomeArquivo?: string,
): string {
  const personalizacoesStr =
    dados.personalizacao && dados.personalizacao.length > 0
      ? dados.personalizacao.join(', ')
      : 'Não definido';

  const tipoFormatado =
    dados.tipo === 'Outro' && dados.tipoOutro && dados.tipoOutro.trim().length > 0
      ? `Outro (${dados.tipoOutro.trim()})`
      : dados.tipo || 'A definir';

  const linhas: string[] = [
    'Olá, Arte e Moda! Gostaria de um orçamento pelo site:',
    '',
    '📋 *DETALHES DO PEDIDO*',
    `• *Tipo:* ${tipoFormatado}`,
    `• *Quantidade:* ${dados.quantidade || 'A definir'}`,
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

  if (nomeArquivo && nomeArquivo.trim().length > 0) {
    linhas.push(
      '',
      `📎 *ARTE / REFERÊNCIA:* ${nomeArquivo.trim()}`,
      '*(Segue a foto/arquivo da arte em anexo nesta conversa)*',
    );
  }

  return linhas.join('\n');
}

/**
 * Cria a URL universal do WhatsApp (wa.me) com a mensagem formatada codificada.
 */
export function criarLinkWhatsappOrcamento(
  dados: Partial<DadosOrcamento>,
  nomeArquivo?: string,
): string {
  const mensagem = gerarMensagemOrcamento(dados, nomeArquivo);
  return `https://wa.me/${empresa.contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
