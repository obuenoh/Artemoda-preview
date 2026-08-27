'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { reaisParaCentavos } from '@/lib/numeros';

const remessaSchema = z.object({
  fornecedorId: z.string().min(1, 'Escolha para qual parceiro as peças vão.'),
  clienteId: z.string().optional(),
  referencia: z.string().trim().min(2, 'Dê um nome ao lote, como "Polo Colégio Alfa — agosto".'),
  tipoServico: z.enum(['bordado', 'dtf', 'silk', 'outro']),
  dataEnvio: z.string().min(1, 'Informe o dia em que as peças saíram.'),
  previsaoRetorno: z.string().min(1, 'Informe até quando as peças devem voltar.'),
  quantidadeEnviada: z.coerce.number().int().positive('Informe quantas peças saíram.'),
  observacoes: z.string().optional(),
});

export type Resultado = { erro?: string; campos?: Record<string, string> } | null;

export async function criarRemessa(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const bruto = Object.fromEntries(form) as Record<string, string>;
  const parsed = remessaSchema.safeParse(bruto);

  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const c = i.path[0];
      if (typeof c === 'string' && !campos[c]) campos[c] = i.message;
    }
    return { erro: 'Confira os campos marcados.', campos };
  }

  const valor = reaisParaCentavos(bruto.valorPorPeca ?? '');
  if (valor === null || valor < 0) {
    return { erro: 'Confira os campos marcados.', campos: { valorPorPeca: 'Informe quanto o parceiro cobra por peça, como 3,50.' } };
  }

  const envio = new Date(parsed.data.dataEnvio);
  const previsao = new Date(parsed.data.previsaoRetorno);
  if (previsao < envio) {
    return {
      erro: 'Confira os campos marcados.',
      campos: { previsaoRetorno: 'A data de volta não pode ser antes da data em que as peças saíram.' },
    };
  }

  const remessa = await db.remessa.create({
    data: {
      empresaId: usuario.empresaId,
      fornecedorId: parsed.data.fornecedorId,
      clienteId: parsed.data.clienteId || null,
      referencia: parsed.data.referencia,
      tipoServico: parsed.data.tipoServico,
      dataEnvio: envio,
      previsaoRetorno: previsao,
      quantidadeEnviada: parsed.data.quantidadeEnviada,
      valorPorPecaCentavos: valor,
      observacoes: parsed.data.observacoes || null,
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'remessa',
    entidadeId: remessa.id,
    acao: 'criou',
    resumo: `Enviou ${parsed.data.quantidadeEnviada} peças para ${parsed.data.tipoServico} — ${parsed.data.referencia}`,
  });

  revalidatePath('/parceiros');
  revalidatePath('/');
  redirect('/parceiros');
}

const retornoSchema = z.object({
  remessaId: z.string().min(1),
  dataRetorno: z.string().min(1, 'Informe o dia em que as peças voltaram.'),
  quantidadeOk: z.coerce.number().int().min(0, 'Não pode ser negativo.'),
  quantidadeDefeito: z.coerce.number().int().min(0, 'Não pode ser negativo.'),
  motivoDefeito: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function registrarRetorno(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const parsed = retornoSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const c = i.path[0];
      if (typeof c === 'string' && !campos[c]) campos[c] = i.message;
    }
    return { erro: 'Confira os campos marcados.', campos };
  }

  const d = parsed.data;
  if (d.quantidadeOk + d.quantidadeDefeito === 0) {
    return { erro: 'Informe quantas peças voltaram — nem que seja só as com defeito.' };
  }

  const remessa = await db.remessa.findFirst({
    where: { id: d.remessaId, empresaId: usuario.empresaId },
    include: { retornos: true },
  });
  if (!remessa) return { erro: 'Remessa não encontrada.' };

  const jaVoltaram = remessa.retornos.reduce(
    (s, r) => s + r.quantidadeOk + r.quantidadeDefeito,
    0,
  );
  const restam = remessa.quantidadeEnviada - jaVoltaram;

  if (d.quantidadeOk + d.quantidadeDefeito > restam) {
    return {
      erro: `Estão voltando mais peças do que saíram. Faltavam ${restam} peça(s) desta remessa.`,
    };
  }

  if (d.quantidadeDefeito > 0 && !d.motivoDefeito?.trim()) {
    return {
      erro: 'Confira os campos marcados.',
      campos: { motivoDefeito: 'Conte o que veio errado — é o que permite cobrar do parceiro depois.' },
    };
  }

  await db.retorno.create({
    data: {
      remessaId: d.remessaId,
      dataRetorno: new Date(d.dataRetorno),
      quantidadeOk: d.quantidadeOk,
      quantidadeDefeito: d.quantidadeDefeito,
      motivoDefeito: d.motivoDefeito || null,
      observacoes: d.observacoes || null,
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'remessa',
    entidadeId: d.remessaId,
    acao: 'alterou',
    resumo: `Registrou volta de ${d.quantidadeOk} boas e ${d.quantidadeDefeito} com defeito`,
  });

  revalidatePath('/parceiros');
  revalidatePath(`/parceiros/${d.remessaId}`);
  revalidatePath('/');
  redirect(`/parceiros/${d.remessaId}`);
}
