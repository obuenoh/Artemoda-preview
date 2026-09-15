'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { numeroParaMil, reaisParaCentavos } from '@/lib/numeros';

export type Resultado = { erro?: string; campos?: Record<string, string> } | null;

function erros(issues: z.ZodIssue[]): Resultado {
  const campos: Record<string, string> = {};
  for (const i of issues) {
    const c = i.path[0];
    if (typeof c === 'string' && !campos[c]) campos[c] = i.message;
  }
  return { erro: 'Confira os campos marcados.', campos };
}

// ───────────────────────────────────────────────────────────── fornecedor

const fornecedorSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do fornecedor.'),
  cnpj: z.string().optional(),
  contato: z.string().optional(),
  whatsapp: z.string().optional(),
  condicaoPagamento: z.enum(['a_vista', '30', '30_60']),
  prazoMedioDias: z.coerce.number().int().min(0).max(365),
  observacoes: z.string().optional(),
});

export async function criarFornecedor(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const parsed = fornecedorSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return erros(parsed.error.issues);

  const tipos = form.getAll('tipos').map(String);
  if (tipos.length === 0) {
    return {
      erro: 'Confira os campos marcados.',
      campos: { tipos: 'Marque pelo menos o que esse fornecedor faz ou vende.' },
    };
  }

  const f = await db.fornecedor.create({
    data: {
      empresaId: usuario.empresaId,
      ...parsed.data,
      cnpj: parsed.data.cnpj || null,
      contato: parsed.data.contato || null,
      whatsapp: parsed.data.whatsapp || null,
      observacoes: parsed.data.observacoes || null,
      tipos: tipos.join(','),
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'fornecedor',
    entidadeId: f.id,
    acao: 'criou',
    resumo: `Cadastrou o fornecedor ${f.nome}`,
  });

  revalidatePath('/fornecedores');
  redirect(`/fornecedores/${f.id}`);
}

/**
 * Preco novo NUNCA sobrescreve o antigo: fecha a vigencia da tabela atual
 * e cria outra. E assim que o historico existe e que da para dizer
 * "esse fornecedor subiu 12% desde a ultima compra".
 */
export async function novaTabelaPreco(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const fornecedorId = String(form.get('fornecedorId') ?? '');
  const tipo = String(form.get('tipo') ?? 'materia_prima');
  const descricao = String(form.get('descricao') ?? '').trim();
  const unidade = String(form.get('unidade') ?? 'metro');
  const materiaPrimaId = String(form.get('materiaPrimaId') ?? '');
  const tipoServico = String(form.get('tipoServico') ?? '');
  const preco = reaisParaCentavos(String(form.get('preco') ?? ''));

  const campos: Record<string, string> = {};
  if (tipo === 'materia_prima' && !materiaPrimaId) campos.materiaPrimaId = 'Escolha o tecido.';
  if (tipo === 'servico' && !descricao) campos.descricao = 'Descreva o serviço, como "bordado de logo pequeno".';
  if (preco === null || preco <= 0) campos.preco = 'Informe o preço, como 18,40.';
  if (Object.keys(campos).length > 0) return { erro: 'Confira os campos marcados.', campos };

  const fornecedor = await db.fornecedor.findFirst({
    where: { id: fornecedorId, empresaId: usuario.empresaId },
  });
  if (!fornecedor) return { erro: 'Fornecedor não encontrado.' };

  const agora = new Date();

  await db.$transaction(async (tx) => {
    // Fecha a vigencia anterior — nada e apagado.
    await tx.tabelaPreco.updateMany({
      where: { fornecedorId, vigenciaFim: null },
      data: { vigenciaFim: agora },
    });

    const anterior = await tx.tabelaPreco.findFirst({
      where: { fornecedorId },
      orderBy: { vigenciaInicio: 'desc' },
      include: { itens: true },
    });

    const tabela = await tx.tabelaPreco.create({
      data: { fornecedorId, vigenciaInicio: agora },
    });

    // Carrega os precos que continuam valendo para a nova vigencia.
    const herdados = (anterior?.itens ?? []).filter((i) =>
      tipo === 'materia_prima' ? i.materiaPrimaId !== materiaPrimaId : i.descricao !== descricao,
    );

    for (const i of herdados) {
      await tx.tabelaPrecoItem.create({
        data: {
          tabelaPrecoId: tabela.id,
          tipo: i.tipo,
          materiaPrimaId: i.materiaPrimaId,
          tipoServico: i.tipoServico,
          descricao: i.descricao,
          unidade: i.unidade,
          precoCentavos: i.precoCentavos,
        },
      });
    }

    let nomeItem = descricao;
    if (tipo === 'materia_prima') {
      const mp = await tx.materiaPrima.findUnique({ where: { id: materiaPrimaId } });
      nomeItem = mp ? `${mp.nome}${mp.cor ? ` ${mp.cor}` : ''}` : descricao;
    }

    await tx.tabelaPrecoItem.create({
      data: {
        tabelaPrecoId: tabela.id,
        tipo,
        materiaPrimaId: tipo === 'materia_prima' ? materiaPrimaId : null,
        tipoServico: tipo === 'servico' ? tipoServico || 'outro' : null,
        descricao: nomeItem,
        unidade: tipo === 'servico' ? 'peca' : unidade,
        precoCentavos: preco!,
      },
    });
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'fornecedor',
    entidadeId: fornecedorId,
    acao: 'alterou',
    resumo: `Novo preço registrado para ${fornecedor.nome}`,
  });

  revalidatePath(`/fornecedores/${fornecedorId}`);
  revalidatePath('/comparador');
  return null;
}

// ─────────────────────────────────────────────────────────────── cliente

const clienteSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do cliente.'),
  tipo: z.enum(['escola', 'empresa', 'marca']),
  cnpj: z.string().optional(),
  contato: z.string().optional(),
  whatsapp: z.string().optional(),
  condicaoPagamento: z.enum(['a_vista', '30', '30_60']),
  observacoes: z.string().optional(),
});

export async function criarCliente(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'vendas');

  const parsed = clienteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return erros(parsed.error.issues);

  const c = await db.cliente.create({
    data: {
      empresaId: usuario.empresaId,
      ...parsed.data,
      cnpj: parsed.data.cnpj || null,
      contato: parsed.data.contato || null,
      whatsapp: parsed.data.whatsapp || null,
      observacoes: parsed.data.observacoes || null,
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'cliente',
    entidadeId: c.id,
    acao: 'criou',
    resumo: `Cadastrou o cliente ${c.nome}`,
  });

  revalidatePath('/clientes');
  redirect('/clientes');
}

// ────────────────────────────────────────────────────────────── tecido

const tecidoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do tecido, como "Malha PV".'),
  composicao: z.string().optional(),
  cor: z.string().optional(),
  unidade: z.enum(['metro', 'kg']),
  localizacao: z.string().optional(),
});

/** Acha o tipo "Tecido" da empresa, ou cria se por algum motivo não existir. */
async function tipoProdutoTecido(empresaId: string) {
  const existente = await db.tipoProduto.findFirst({ where: { empresaId, nome: 'Tecido' } });
  if (existente) return existente;
  return db.tipoProduto.create({
    data: { empresaId, nome: 'Tecido', unidadePadrao: 'metro', mostrarCamposTecido: true },
  });
}

export async function criarTecido(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const bruto = Object.fromEntries(form) as Record<string, string>;
  const parsed = tecidoSchema.safeParse(bruto);
  if (!parsed.success) return erros(parsed.error.issues);

  const minimo = bruto.estoqueMinimo ? numeroParaMil(bruto.estoqueMinimo) : 0;
  const largura = bruto.largura ? numeroParaMil(bruto.largura) : null;

  if (minimo === null) {
    return {
      erro: 'Confira os campos marcados.',
      campos: { estoqueMinimo: 'Use só número, como 40 ou 40,5.' },
    };
  }

  const tipo = await tipoProdutoTecido(usuario.empresaId);

  const mp = await db.materiaPrima.create({
    data: {
      empresaId: usuario.empresaId,
      tipoProdutoId: tipo.id,
      nome: parsed.data.nome,
      composicao: parsed.data.composicao || null,
      cor: parsed.data.cor || null,
      unidade: parsed.data.unidade,
      localizacao: parsed.data.localizacao || null,
      larguraMil: largura,
      gramaturaGm2: bruto.gramatura ? Number(bruto.gramatura) || null : null,
      estoqueMinimoMil: minimo,
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'materia_prima',
    entidadeId: mp.id,
    acao: 'criou',
    resumo: `Cadastrou o tecido ${mp.nome}`,
  });

  revalidatePath('/tecidos');
  revalidatePath('/estoque');
  redirect('/tecidos');
}

// ───────────────────────────────────────── produto de estoque (setores)

const tipoProdutoSchema = z.object({
  nome: z.string().trim().min(2, 'Dê um nome ao tipo, como "Zíper".'),
  unidadePadrao: z.enum(['metro', 'kg', 'unidade']),
});

/** "+ Novo tipo" na tela de Estoque — lista aberta, sem depender de código. */
export async function criarTipoProduto(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const parsed = tipoProdutoSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return erros(parsed.error.issues);

  const jaExiste = await db.tipoProduto.findFirst({
    where: { empresaId: usuario.empresaId, nome: parsed.data.nome },
  });
  if (jaExiste) {
    return {
      erro: 'Confira os campos marcados.',
      campos: { nome: 'Já existe um tipo com esse nome.' },
    };
  }

  await db.tipoProduto.create({
    data: { empresaId: usuario.empresaId, nome: parsed.data.nome, unidadePadrao: parsed.data.unidadePadrao },
  });

  revalidatePath('/estoque');
  revalidatePath('/estoque/novo-produto');
  return null;
}

const produtoEstoqueSchema = z.object({
  tipoProdutoId: z.string().min(1, 'Escolha o tipo do produto.'),
  nome: z.string().trim().min(2, 'Informe o nome do produto.'),
  cor: z.string().optional(),
  unidade: z.enum(['metro', 'kg', 'unidade']),
  localizacao: z.string().optional(),
});

/** Cadastro genérico de item de estoque — qualquer setor, não só tecido. */
export async function criarProdutoEstoque(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirPapel('dona', 'producao');

  const bruto = Object.fromEntries(form) as Record<string, string>;
  const parsed = produtoEstoqueSchema.safeParse(bruto);
  if (!parsed.success) return erros(parsed.error.issues);

  const tipo = await db.tipoProduto.findFirst({
    where: { id: parsed.data.tipoProdutoId, empresaId: usuario.empresaId },
  });
  if (!tipo) {
    return { erro: 'Confira os campos marcados.', campos: { tipoProdutoId: 'Escolha um tipo válido.' } };
  }

  const minimo = bruto.estoqueMinimo ? numeroParaMil(bruto.estoqueMinimo) : 0;
  if (minimo === null) {
    return {
      erro: 'Confira os campos marcados.',
      campos: { estoqueMinimo: 'Use só número, como 40 ou 40,5.' },
    };
  }

  const largura = tipo.mostrarCamposTecido && bruto.largura ? numeroParaMil(bruto.largura) : null;

  const mp = await db.materiaPrima.create({
    data: {
      empresaId: usuario.empresaId,
      tipoProdutoId: tipo.id,
      nome: parsed.data.nome,
      cor: parsed.data.cor || null,
      unidade: parsed.data.unidade,
      localizacao: parsed.data.localizacao || null,
      composicao: tipo.mostrarCamposTecido ? (bruto.composicao || null) : null,
      larguraMil: largura,
      gramaturaGm2: tipo.mostrarCamposTecido && bruto.gramatura ? Number(bruto.gramatura) || null : null,
      estoqueMinimoMil: minimo,
    },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'materia_prima',
    entidadeId: mp.id,
    acao: 'criou',
    resumo: `Cadastrou ${tipo.nome.toLowerCase()}: ${mp.nome}`,
  });

  revalidatePath('/estoque');
  redirect('/estoque');
}
