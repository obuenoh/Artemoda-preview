/**
 * MODULO UNICO DE LEAD (servidor).
 *
 * Tudo que acontece com um lead depois do envio — validacao final, e-mail e
 * persistencia — mora aqui. Nenhum componente e nenhuma outra rota tocam nisso.
 *
 * O gerenciador interno que sera construido depois vai consumir exatamente
 * estes tipos e esta funcao: trocar `persistir()` por uma escrita em banco
 * nao deve exigir mudanca em nenhum outro arquivo do site.
 *
 * O contrato de campos vive em lib/lead-schema.ts, compartilhado com o form.
 */

import 'server-only';
import { leadSchema, type Lead } from './lead-schema';

export { TIPOS, PERSONALIZACOES, PRAZOS, leadSchema } from './lead-schema';
export type { Lead } from './lead-schema';

export type Anexo = { nome: string; tipo: string; conteudoBase64: string };

export type ResultadoLead =
  | { ok: true; id: string }
  | { ok: false; erro: string; campos?: Record<string, string> };

const MAX_ANEXO_BYTES = 4 * 1024 * 1024; // 4 MB — limite pratico de anexo de e-mail

function idLead(): string {
  return `AM-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function linhasEmail(lead: Lead, id: string, anexo?: Anexo): string {
  const utm =
    lead.utm && Object.keys(lead.utm).length > 0
      ? Object.entries(lead.utm)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      : 'Sem UTM (acesso direto ou orgânico)';

  return [
    `NOVO ORÇAMENTO — ${lead.tipo}${lead.tipoOutro ? ` (${lead.tipoOutro})` : ''}`,
    `Protocolo: ${id}`,
    '',
    `Nome: ${lead.nome}`,
    `Empresa/Escola: ${lead.organizacao}`,
    `WhatsApp: ${lead.whatsapp}`,
    `E-mail: ${lead.email}`,
    `Cidade: ${lead.cidade}`,
    '',
    `Quantidade: ${lead.quantidade}`,
    `Personalização: ${lead.personalizacao.join(', ')}`,
    '',
    `Mensagem: ${lead.mensagem || '—'}`,
    `Anexo: ${anexo ? anexo.nome : 'nenhum'}`,
    '',
    `Origem: ${lead.origem || '—'}`,
    '--- Atribuição ---',
    utm,
  ].join('\n');
}

/** Persistencia. Hoje: JSONL em disco. Amanha: banco do gerenciador interno. */
async function persistir(id: string, lead: Lead): Promise<void> {
  try {
    const { appendFile, mkdir } = await import('node:fs/promises');
    const { join } = await import('node:path');

    const dir = process.env.LEADS_DIR || join(process.cwd(), 'leads');
    await mkdir(dir, { recursive: true });

    const registro = JSON.stringify({ id, recebidoEm: new Date().toISOString(), ...lead });
    await appendFile(join(dir, 'leads.jsonl'), `${registro}\n`, 'utf8');
  } catch (erro) {
    // Persistencia nunca derruba o lead: o e-mail ja saiu.
    console.error('[lead] falha ao persistir', erro);
  }
}

async function enviarEmail(id: string, lead: Lead, anexo?: Anexo): Promise<void> {
  const chave = process.env.RESEND_API_KEY;
  const para = process.env.LEAD_EMAIL_TO;
  const de = process.env.LEAD_EMAIL_FROM;

  if (!chave || !para || !de) {
    // Ambiente sem credencial (dev local): registra e segue, sem quebrar o fluxo.
    console.warn(`[lead] Resend não configurado — lead ${id} apenas persistido.`);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(chave);

  const anexos =
    anexo && anexo.conteudoBase64.length * 0.75 < MAX_ANEXO_BYTES
      ? [{ filename: anexo.nome, content: anexo.conteudoBase64 }]
      : undefined;

  const { error } = await resend.emails.send({
    from: de,
    to: para.split(',').map((e) => e.trim()),
    replyTo: lead.email,
    subject: `Orçamento ${lead.tipo} — ${lead.organizacao} (${id})`,
    text: linhasEmail(lead, id, anexo),
    attachments: anexos,
  });

  if (error) throw new Error(error.message);
}

/** Ponto de entrada unico. A rota de API nao faz nada alem de chamar isto. */
export async function registrarLead(entrada: unknown, anexo?: Anexo): Promise<ResultadoLead> {
  const parsed = leadSchema.safeParse(entrada);

  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = issue.path[0];
      if (typeof campo === 'string' && !campos[campo]) campos[campo] = issue.message;
    }
    return { ok: false, erro: 'Alguns campos precisam de ajuste.', campos };
  }

  const lead = parsed.data;

  // Honeypot preenchido: responde como sucesso para nao ensinar o bot.
  if (lead.website && lead.website.length > 0) {
    return { ok: true, id: idLead() };
  }

  const id = idLead();

  try {
    await enviarEmail(id, lead, anexo);
  } catch (erro) {
    console.error('[lead] falha no envio de e-mail', erro);
    await persistir(id, lead);
    return {
      ok: false,
      erro: 'Não conseguimos enviar agora. Chama no WhatsApp que a gente resolve na hora.',
    };
  }

  await persistir(id, lead);
  return { ok: true, id };
}
