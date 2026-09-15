'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { reaisParaCentavos } from '@/lib/numeros';
import { lancarProduto, buscarPorSku } from '@/lib/produtos';

export type Resultado = { erro?: string; campos?: Record<string, string> } | null;

function erros(issues: z.ZodIssue[]): Resultado {
  const campos: Record<string, string> = {};
  for (const i of issues) {
    const c = i.path[0];
    if (typeof c === 'string' && !campos[c]) campos[c] = i.message;
  }
  return { erro: 'Confira os campos marcados.', campos };
}

// ─────────────────────────────────────────────── bipagem: busca por SKU

export type ProdutoEncontrado = {
  id: string;
  nome: string;
  tamanho: string | null;
  cor: string | null;
  sku: string;
  precoVendaCentavos: number;
  saldo: number;
};

/** Chamada direto do client a cada Enter no campo de bipagem. */
export async function buscarProdutoPorSku(sku: string): Promise<ProdutoEncontrado | null> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');
  const produto = await buscarPorSku(usuario.empresaId, sku);
  if (!produto || !produto.ativo) return null;

  const { estadoProduto } = await import('@/lib/produtos');
  const estado = await estadoProduto(produto.id);

  return {
    id: produto.id,
    nome: produto.nome,
    tamanho: produto.tamanho,
    cor: produto.cor,
    sku: produto.sku,
    precoVendaCentavos: produto.precoVendaCentavos,
    saldo: estado.saldo,
  };
}

// ─────────────────────────────────────────────────────── finalizar venda

const itemSchema = z.object({
  produtoAcabadoId: z.string().min(1),
  quantidade: z.number().int().positive(),
  precoUnitarioCentavos: z.number().int().min(0),
});

export type CarrinhoItem = z.infer<typeof itemSchema>;

/**
 * Recebe o carrinho pronto (montado no client a partir da bipagem) e faz
 * tudo numa transação: cria a venda, baixa cada peça do estoque via
 * lancarProduto (nunca UPDATE direto) e lança a entrada no caixa.
 */
export async function finalizarVenda(dados: {
  canal: 'loja' | 'producao';
  clienteId: string | null;
  formaPagamento: string;
  observacoes: string;
  itens: CarrinhoItem[];
}): Promise<{ erro: string } | { ok: true; vendaId: string }> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  if (dados.itens.length === 0) return { erro: 'Adicione ao menos uma peça antes de finalizar.' };
  if (dados.canal === 'producao' && !dados.clienteId) {
    return { erro: 'Pedido de produção precisa de um cliente.' };
  }

  const parsedItens = z.array(itemSchema).safeParse(dados.itens);
  if (!parsedItens.success) return { erro: 'Carrinho inválido — recarregue a página e tente de novo.' };

  const totalCentavos = parsedItens.data.reduce(
    (s, i) => s + i.quantidade * i.precoUnitarioCentavos,
    0,
  );

  try {
    const vendaId = await db.$transaction(async (tx) => {
      const venda = await tx.venda.create({
        data: {
          empresaId: usuario.empresaId,
          clienteId: dados.clienteId,
          canal: dados.canal,
          formaPagamento: dados.formaPagamento,
          totalCentavos,
          observacoes: dados.observacoes || null,
          usuarioId: usuario.id,
        },
      });

      for (const item of parsedItens.data) {
        await tx.vendaItem.create({
          data: {
            vendaId: venda.id,
            produtoAcabadoId: item.produtoAcabadoId,
            quantidade: item.quantidade,
            precoUnitarioCentavos: item.precoUnitarioCentavos,
          },
        });

        await lancarProduto(
          {
            empresaId: usuario.empresaId,
            produtoAcabadoId: item.produtoAcabadoId,
            tipo: 'saida_venda',
            quantidade: -item.quantidade,
            origemTipo: 'venda',
            origemId: venda.id,
            motivo: 'Venda',
            usuarioId: usuario.id,
          },
          tx,
        );
      }

      // Fiado ainda não entrou no caixa — vira contas a receber na Fase 3.
      if (dados.formaPagamento !== 'fiado') {
        await tx.lancamentoCaixa.create({
          data: {
            empresaId: usuario.empresaId,
            tipo: 'entrada',
            origemTipo: 'venda',
            origemId: venda.id,
            valorCentavos: totalCentavos,
            descricao: dados.canal === 'loja' ? 'Venda na loja' : 'Venda de produção',
            usuarioId: usuario.id,
          },
        });
      }

      return venda.id;
    });

    await registrarAuditoria({
      empresaId: usuario.empresaId,
      usuarioId: usuario.id,
      entidade: 'venda',
      entidadeId: vendaId,
      acao: 'criou',
      resumo: `Venda de ${parsedItens.data.length} item(ns) — ${dados.canal}`,
    });

    revalidatePath('/vendas');
    revalidatePath('/vendas/estoque');
    revalidatePath('/');
    return { ok: true, vendaId };
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Não foi possível registrar a venda.' };
  }
}

// ──────────────────────────────────────────────────── cadastro de peça

const produtoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome da peça, como "Camisa Colégio Alfa".'),
  tamanho: z.string().optional(),
  cor: z.string().optional(),
  sku: z.string().trim().min(1, 'Informe o código (SKU ou código de barras).'),
  estoqueMinimo: z.coerce.number().int().min(0).default(0),
});

export async function criarProdutoAcabado(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  const parsed = produtoSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return erros(parsed.error.issues);

  const preco = reaisParaCentavos(String(form.get('precoVenda') ?? ''));
  if (preco === null || preco <= 0) {
    return { erro: 'Confira os campos marcados.', campos: { precoVenda: 'Informe o preço de venda, como 45,00.' } };
  }
  const custoTexto = String(form.get('custo') ?? '').trim();
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

  revalidatePath('/vendas/estoque');
  redirect('/vendas/estoque');
}

// ───────────────────────────────────────── entrada de produção (peça pronta)

const entradaSchema = z.object({
  produtoAcabadoId: z.string().min(1),
  quantidade: z.coerce.number().int().positive('Informe quantas peças chegaram da produção.'),
});

export async function registrarEntradaProducao(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  const parsed = entradaSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return erros(parsed.error.issues);

  const produto = await db.produtoAcabado.findFirst({
    where: { id: parsed.data.produtoAcabadoId, empresaId: usuario.empresaId },
  });
  if (!produto) return { erro: 'Peça não encontrada.' };

  await lancarProduto({
    empresaId: usuario.empresaId,
    produtoAcabadoId: produto.id,
    tipo: 'entrada_producao',
    quantidade: parsed.data.quantidade,
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
    resumo: `Entrada de ${parsed.data.quantidade} peça(s) — ${produto.nome}`,
  });

  revalidatePath('/vendas/estoque');
  revalidatePath('/vendas');
  redirect('/vendas/estoque');
}
