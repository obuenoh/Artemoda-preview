/**
 * Contrato do lead — compartilhado entre cliente e servidor.
 *
 * Fica separado de lib/leads.ts de proposito: o formulario precisa das
 * mensagens de validacao no navegador, e lib/leads.ts carrega Resend e
 * filesystem, que nao podem entrar no bundle do cliente.
 */

import { z } from 'zod';

export const TIPOS = [
  'Uniforme escolar',
  'Uniforme empresarial',
  'Private label',
  'Outro',
] as const;

export const PERSONALIZACOES = ['DTF', 'Silk screen', 'Bordado', 'Não sei ainda'] as const;

export const PRAZOS = [
  'O quanto antes',
  'Em até 30 dias',
  'Em 1 a 3 meses',
  'Ainda estou planejando',
] as const;

/** Mensagens especificas — nunca "campo inválido". */
export const leadSchema = z.object({
  tipo: z.enum(TIPOS, {
    errorMap: () => ({ message: 'Escolha o tipo de produção que você precisa.' }),
  }),

  quantidade: z
    .string()
    .trim()
    .min(1, 'Informe uma quantidade aproximada — nosso pedido mínimo é de 30 peças.')
    .refine((v) => /\d/.test(v), 'Informe a quantidade em número (ex: 50 peças).')
    .refine((v) => {
      const match = v.match(/\d+/);
      if (!match) return false;
      const num = parseInt(match[0], 10);
      return num >= 30;
    }, 'Nosso pedido mínimo de confecção é de 30 peças. Por favor, informe 30 ou mais.'),

  prazo: z.enum(PRAZOS, {
    errorMap: () => ({ message: 'Escolha o prazo que você tem em mente.' }),
  }),

  personalizacao: z
    .array(z.enum(PERSONALIZACOES))
    .min(1, 'Marque pelo menos uma opção. Se ainda não sabe, marque "Não sei ainda".'),

  nome: z
    .string()
    .trim()
    .min(2, 'Informe o seu nome.')
    .max(120, 'Nome muito longo — use o nome como você é chamado.'),

  organizacao: z
    .string()
    .trim()
    .min(2, 'Informe o nome da empresa, escola ou marca.')
    .max(160, 'Nome muito longo.'),

  whatsapp: z
    .string()
    .trim()
    .min(1, 'Informe um WhatsApp com DDD.')
    .refine((v) => {
      const digitos = v.replace(/\D/g, '');
      return digitos.length === 10 || digitos.length === 11;
    }, 'Informe um WhatsApp com DDD — 11 dígitos, como (11) 91234-5678.'),

  email: z
    .string()
    .trim()
    .min(1, 'Informe um e-mail para enviarmos a proposta.')
    .email('Esse e-mail parece incompleto. Confira se tem o @ e o domínio.'),

  cidade: z
    .string()
    .trim()
    .min(2, 'Informe a cidade onde a entrega vai acontecer.')
    .max(120, 'Nome de cidade muito longo.'),

  mensagem: z
    .string()
    .trim()
    .max(2000, 'Mensagem muito longa — resuma em até 2000 caracteres.')
    .optional(),

  consentimento: z.literal(true, {
    errorMap: () => ({ message: 'Precisamos do seu aceite para tratar os dados e responder.' }),
  }),

  // Antispam invisivel: bot preenche, gente nao ve.
  website: z.string().max(0, 'Erro de validação.').optional(),

  // Atribuicao de campanha.
  utm: z.record(z.string()).optional(),
  origem: z.string().max(120).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
