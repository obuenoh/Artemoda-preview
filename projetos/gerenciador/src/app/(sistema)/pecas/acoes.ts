'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { reaisParaCentavos } from '@/lib/numeros';
import { lancarProduto, estadoProduto } from '@/lib/produtos';
import { aFrente, daFrente, ehFrente, paraFrente, rotuloFrente } from '@/lib/frentes';

export type Resultado = { erro?: string; campos?: Record<string, string>; ok?: string } | null;

function erros(issues: z.ZodIssue[]): Resultado {
  const campos: Record<string, string> = {};
  for (const i of issues) {
    const c = i.path[0];
    if (typeof c === 'string' && !campos[c]) campos[c] = i.message;
  }
  return { erro: 'Confira os campos marcados.', campos };
}

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? '').trim();

function revalidarPecas() {
  revalidatePath('/pecas', 'layout');
  revalidatePath('/vendas', 'layout');
  revalidatePath('/');
}

// ──────────────────────────────────────────────────── cadastro de peça

const produtoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome da peça, como "Camisa Colégio Alfa".'),
  tamanho: z.string().optional(),
  cor: z.string().optional(),
  sku: z.string({ required_error: 'Informe o código (SKU ou código de barras).' }).trim().min(1, 'Informe o código (SKU ou código de barras).'),
  estoqueMinimo: z.coerce.number().int().min(0).default(0),
});

export async function criarProdutoAcabado(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  const parsed = produtoSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return erros(parsed.error.issues);

  const preco = reaisParaCentavos(texto(form, 'precoVenda'));
  if (preco === null || preco <= 0) {
    return { erro: 'Confira os campos marcados.', campos: { precoVenda: 'Informe o preço de venda, como 45,00.' } };
  }
  const custoTexto = texto(form, 'custo');
  const custo = custoTexto ? reaisParaCentavos(custoTexto) : 0;

  const jaExiste = await db.produtoAcabado.findUnique({
    where: { empresaId_sku: { empresaId: usuario.empresaId, sku: parsed.data.sku } },
  });
  if (jaExiste) {
    return { erro: 'Confira os campos marcados.', campos: { sku: 'Já existe uma peça com esse código.' } };
  }

  const produto = await db.produtoAcabado.create({
    data: {
      empresaId: usuario.empresaId,
      nome: parsed.data.nome,
      tamanho: parsed.data.tamanho || null,
      cor: parsed.data.cor || null,
      sku: parsed.data.sku,
      precoVendaCentavos: preco,
      custoCentavos: custo ?? 0,
      estoqueMinimo: parsed.data.estoqueMinimo,
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'produto_acabado',
    entidadeId: produto.id,
    acao: 'criou',
    resumo: `Cadastrou a peça ${produto.nome} (${produto.sku})`,
  });

  revalidarPecas();
  redirect('/pecas');
}

// ───────────────────────────────────────── produção: entra na Fábrica

/** Toda peça nasce na Fábrica. Daí ela vai para a Loja ou o E-commerce por envio. */
export async function registrarProducao(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  const quantidade = Number(texto(form, 'quantidade'));
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return { erro: 'Confira o campo marcado.', campos: { quantidade: 'Informe quantas peças ficaram prontas, como 30.' } };
  }

  const produto = await db.produtoAcabado.findFirst({ where: { id: texto(form, 'id'), empresaId: usuario.empresaId } });
  if (!produto) return { erro: 'Peça não encontrada. Recarregue a página.' };

  await lancarProduto({
    empresaId: usuario.empresaId,
    produtoAcabadoId: produto.id,
    frente: 'fabrica',
    tipo: 'entrada_producao',
    quantidade,
    custoUnitarioCentavos: produto.custoCentavos,
    origemTipo: 'manual',
    motivo: 'Entrada da produção',
    usuarioId: usuario.id,
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'produto_acabado',
    entidadeId: produto.id,
    acao: 'alterou',
    resumo: `Produção: ${quantidade} peça(s) de ${produto.nome} entraram na Fábrica`,
  });

  revalidarPecas();
  return { ok: `${quantidade} peça(s) entraram na Fábrica.` };
}

// ─────────────────────────────────────────────── envio entre frentes

/**
 * Envio nao e venda: a peca muda de prateleira, o dinheiro nao sai da
 * empresa. Dois lancamentos com o mesmo envio de origem — sai de uma frente
 * e entra na outra, pelo mesmo custo.
 */
export async function enviarPecas(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  const de = texto(form, 'de');
  const para = texto(form, 'para');
  const quantidade = Number(texto(form, 'quantidade'));
  const campos: Record<string, string> = {};
  if (!ehFrente(de)) campos.de = 'Escolha de onde as peças saem.';
  if (!ehFrente(para)) campos.para = 'Escolha para onde as peças vão.';
  else if (de === para) campos.para = 'Escolha uma frente diferente da de origem.';
  if (!Number.isInteger(quantidade) || quantidade <= 0) campos.quantidade = 'Informe quantas peças, como 10.';

  const produto = await db.produtoAcabado.findFirst({ where: { id: texto(form, 'id'), empresaId: usuario.empresaId } });
  if (!produto) return { erro: 'Peça não encontrada. Recarregue a página.' };

  if (ehFrente(de) && Number.isInteger(quantidade) && quantidade > 0) {
    const saldo = (await estadoProduto(produto.id, de)).saldo;
    if (quantidade > saldo) campos.quantidade = `${aFrente(de)} só tem ${saldo} peça(s) dessa.`;
  }
  if (Object.keys(campos).length > 0 || !ehFrente(de) || !ehFrente(para)) return { erro: 'Confira os campos marcados.', campos };

  await db.$transaction(async (tx) => {
    const envio = await tx.envioPecas.create({
      data: { empresaId: usuario.empresaId, de, para, usuarioId: usuario.id },
    });
    const comum = {
      empresaId: usuario.empresaId,
      produtoAcabadoId: produto.id,
      custoUnitarioCentavos: produto.custoCentavos,
      origemTipo: 'envio',
      origemId: envio.id,
      usuarioId: usuario.id,
    };
    await lancarProduto(
      { ...comum, frente: de, tipo: 'envio_saida', quantidade: -quantidade, motivo: `Enviada ${paraFrente(para)}` },
      tx,
    );
    await lancarProduto(
      { ...comum, frente: para, tipo: 'envio_entrada', quantidade, motivo: `Recebida ${daFrente(de)}` },
      tx,
    );
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'produto_acabado',
    entidadeId: produto.id,
    acao: 'alterou',
    resumo: `Enviou ${quantidade} peça(s) de ${produto.nome}: ${rotuloFrente(de)} → ${rotuloFrente(para)}`,
  });

  revalidarPecas();
  return { ok: `${quantidade} peça(s) enviadas ${paraFrente(para)}.` };
}
