'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import {
  reaisParaCentavos,
  dataDoCampo,
  somarMeses,
  fimDoDia,
  centavosParaReais,
  campoDeData,
} from '@/lib/numeros';
import { ehFrente } from '@/lib/frentes';
import {
  CATEGORIAS_SAIDA,
  CATEGORIAS_ENTRADA,
  FORMAS_PAGAMENTO,
  dividirEmParcelas,
  lancarCaixa,
  saldoCaixa,
  temAbertura,
} from '@/lib/financeiro';

export type Resultado = { erro?: string; campos?: Record<string, string>; ok?: string } | null;

/** Financeiro e so da dona. Toda acao daqui comeca por isto. */
const exigirDona = () => exigirPapel('dona');

function revalidarFinanceiro() {
  revalidatePath('/financeiro', 'layout');
  revalidatePath('/');
}

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? '').trim();

/** Pagamento e recebimento nao podem ser no futuro: o que ainda vai acontecer fica em aberto. */
function dataDoPagamento(valor: string, campos: Record<string, string>): Date | null {
  const data = dataDoCampo(valor);
  if (!data) {
    campos.data = 'Informe o dia em que o dinheiro saiu ou entrou.';
    return null;
  }
  if (data > fimDoDia(new Date())) {
    campos.data = 'Essa data ainda não chegou. Se ainda vai acontecer, deixe a conta em aberto.';
    return null;
  }
  // Hoje vale a hora de agora: o extrato fica na ordem em que as coisas
  // aconteceram (pagou as 9h, desfez as 10h — e nao o contrario).
  return campoDeData(data) === campoDeData(new Date()) ? new Date() : data;
}

type Repeticao = { datas: Date[]; valores: number[]; fixa: boolean };

/**
 * "So esta vez", "dividir em N vezes" (o valor e o total) ou "todo mes"
 * (o valor se repete por 12 meses). Ela nunca calcula parcela.
 */
function montarRepeticao(
  modo: string,
  parcelasTexto: string,
  totalCentavos: number,
  primeiroVencimento: Date,
  campos: Record<string, string>,
): Repeticao | null {
  if (modo === 'parcelada') {
    const n = Number(parcelasTexto);
    if (!Number.isInteger(n) || n < 2 || n > 24) {
      campos.parcelas = 'Informe em quantas vezes, de 2 a 24.';
      return null;
    }
    return {
      datas: Array.from({ length: n }, (_, i) => somarMeses(primeiroVencimento, i)),
      valores: dividirEmParcelas(totalCentavos, n),
      fixa: false,
    };
  }
  if (modo === 'fixa') {
    return {
      datas: Array.from({ length: 12 }, (_, i) => somarMeses(primeiroVencimento, i)),
      valores: Array.from({ length: 12 }, () => totalCentavos),
      fixa: true,
    };
  }
  return { datas: [primeiroVencimento], valores: [totalCentavos], fixa: false };
}

// ──────────────────────────────────────────────────────────── a pagar

export async function criarContaPagar(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();

  const descricao = texto(form, 'descricao');
  const categoria = texto(form, 'categoria');
  const fornecedorId = texto(form, 'fornecedorId');
  const valor = reaisParaCentavos(texto(form, 'valor'));
  const vencimento = dataDoCampo(texto(form, 'vencimento'));
  const modo = texto(form, 'modo');
  const observacoes = texto(form, 'observacoes');

  const campos: Record<string, string> = {};
  if (descricao.length < 2) campos.descricao = 'Diga o que é esta conta, como "Aluguel" ou "DTF do pedido Alfa".';
  if (!(categoria in CATEGORIAS_SAIDA)) campos.categoria = 'Escolha o tipo da conta.';
  if (valor === null || valor <= 0) campos.valor = 'Informe o valor, como 1.250,00.';
  if (!vencimento) campos.vencimento = 'Informe quando vence.';

  if (fornecedorId) {
    const existe = await db.fornecedor.count({ where: { id: fornecedorId, empresaId: usuario.empresaId } });
    if (!existe) campos.fornecedorId = 'Esse fornecedor não foi encontrado. Escolha de novo.';
  }

  const repeticao =
    valor && vencimento ? montarRepeticao(modo, texto(form, 'parcelas'), valor, vencimento, campos) : null;
  if (Object.keys(campos).length > 0 || !repeticao) return { erro: 'Confira os campos marcados.', campos };

  const grupoId = repeticao.datas.length > 1 ? randomUUID() : null;
  const total = repeticao.datas.length;

  await db.$transaction(
    repeticao.datas.map((data, i) =>
      db.contaPagar.create({
        data: {
          empresaId: usuario.empresaId,
          descricao,
          categoria,
          fornecedorId: fornecedorId || null,
          grupoId,
          parcela: i + 1,
          totalParcelas: total,
          fixaMensal: repeticao.fixa,
          valorCentavos: repeticao.valores[i],
          vencimento: data,
          observacoes: observacoes || null,
          usuarioId: usuario.id,
        },
      }),
    ),
  );

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_pagar',
    entidadeId: grupoId ?? descricao,
    acao: 'criou',
    resumo: `Conta a pagar "${descricao}" — ${total} vencimento(s)`,
  });

  revalidarFinanceiro();
  redirect('/financeiro/pagar');
}

export async function pagarConta(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();
  const id = texto(form, 'id');

  const conta = await db.contaPagar.findFirst({ where: { id, empresaId: usuario.empresaId } });
  if (!conta) return { erro: 'Conta não encontrada. Recarregue a página.' };
  if (conta.situacao !== 'aberta') return { erro: 'Esta conta já não está em aberto. Recarregue a página.' };

  const campos: Record<string, string> = {};
  const data = dataDoPagamento(texto(form, 'data'), campos);
  const valor = reaisParaCentavos(texto(form, 'valor'));
  const forma = texto(form, 'forma');
  if (valor === null || valor <= 0) campos.valor = 'Informe quanto pagou, como 1.250,00.';
  if (!(forma in FORMAS_PAGAMENTO)) campos.forma = 'Escolha como pagou.';
  if (Object.keys(campos).length > 0 || !data || !valor) return { erro: 'Confira os campos marcados.', campos };

  const parcela = conta.totalParcelas > 1 && !conta.fixaMensal ? ` (${conta.parcela}/${conta.totalParcelas})` : '';

  await db.$transaction(async (tx) => {
    await lancarCaixa(
      {
        empresaId: usuario.empresaId,
        tipo: 'saida',
        valorCentavos: valor,
        descricao: `${conta.descricao}${parcela}`,
        categoria: conta.categoria,
        origemTipo: 'conta_pagar',
        origemId: conta.id,
        data,
        usuarioId: usuario.id,
      },
      tx,
    );
    await tx.contaPagar.update({
      where: { id: conta.id },
      data: { situacao: 'paga', pagoEm: data, valorPagoCentavos: valor, formaPagamento: forma },
    });
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_pagar',
    entidadeId: conta.id,
    acao: 'alterou',
    resumo: `Pagou "${conta.descricao}${parcela}" — ${centavosParaReais(valor)}`,
  });

  revalidarFinanceiro();
  return { ok: 'Pagamento lançado no caixa.' };
}

export async function cancelarContaPagar(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();
  const id = texto(form, 'id');
  const motivo = texto(form, 'motivo');

  if (motivo.length < 3) return { erro: 'Conte por que esta conta não vai ser paga.', campos: { motivo: 'Motivo obrigatório.' } };

  const conta = await db.contaPagar.findFirst({ where: { id, empresaId: usuario.empresaId } });
  if (!conta || conta.situacao !== 'aberta') return { erro: 'Só dá para cancelar conta em aberto. Recarregue a página.' };

  await db.contaPagar.update({
    where: { id: conta.id },
    data: { situacao: 'cancelada', motivoCancelamento: motivo },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_pagar',
    entidadeId: conta.id,
    acao: 'anulou',
    resumo: `Cancelou "${conta.descricao}": ${motivo}`,
  });

  revalidarFinanceiro();
  return { ok: 'Conta cancelada.' };
}

/** Pagamento lancado por engano: o caixa recebe o estorno, a conta volta a ficar aberta. */
export async function desfazerPagamento(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();
  const id = texto(form, 'id');
  const motivo = texto(form, 'motivo');

  if (motivo.length < 3) return { erro: 'Conte o que aconteceu para desfazer.', campos: { motivo: 'Motivo obrigatório.' } };

  const conta = await db.contaPagar.findFirst({ where: { id, empresaId: usuario.empresaId } });
  if (!conta || conta.situacao !== 'paga' || !conta.valorPagoCentavos) {
    return { erro: 'Só dá para desfazer conta paga. Recarregue a página.' };
  }

  await db.$transaction(async (tx) => {
    await lancarCaixa(
      {
        empresaId: usuario.empresaId,
        tipo: 'entrada',
        valorCentavos: conta.valorPagoCentavos!,
        descricao: `Estorno de "${conta.descricao}": ${motivo}`,
        origemTipo: 'estorno',
        origemId: conta.id,
        usuarioId: usuario.id,
      },
      tx,
    );
    await tx.contaPagar.update({
      where: { id: conta.id },
      data: { situacao: 'aberta', pagoEm: null, valorPagoCentavos: null, formaPagamento: null },
    });
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_pagar',
    entidadeId: conta.id,
    acao: 'ajustou',
    resumo: `Desfez pagamento de "${conta.descricao}": ${motivo}`,
  });

  revalidarFinanceiro();
  return { ok: 'Pagamento desfeito. A conta voltou para em aberto.' };
}

// ────────────────────────────────────────────────────────── a receber

export async function criarContaReceber(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();

  const descricao = texto(form, 'descricao');
  const clienteId = texto(form, 'clienteId');
  const valor = reaisParaCentavos(texto(form, 'valor'));
  const vencimento = dataDoCampo(texto(form, 'vencimento'));
  const modo = texto(form, 'modo') === 'parcelada' ? 'parcelada' : 'unica';
  const observacoes = texto(form, 'observacoes');

  const campos: Record<string, string> = {};
  if (descricao.length < 2) campos.descricao = 'Diga o que é, como "Restante do pedido Colégio Alfa".';
  if (valor === null || valor <= 0) campos.valor = 'Informe o valor, como 1.250,00.';
  if (!vencimento) campos.vencimento = 'Informe quando o cliente paga.';

  if (clienteId) {
    const existe = await db.cliente.count({ where: { id: clienteId, empresaId: usuario.empresaId } });
    if (!existe) campos.clienteId = 'Esse cliente não foi encontrado. Escolha de novo.';
  }

  const repeticao =
    valor && vencimento ? montarRepeticao(modo, texto(form, 'parcelas'), valor, vencimento, campos) : null;
  if (Object.keys(campos).length > 0 || !repeticao) return { erro: 'Confira os campos marcados.', campos };

  const grupoId = repeticao.datas.length > 1 ? randomUUID() : null;
  const total = repeticao.datas.length;

  await db.$transaction(
    repeticao.datas.map((data, i) =>
      db.contaReceber.create({
        data: {
          empresaId: usuario.empresaId,
          descricao,
          clienteId: clienteId || null,
          grupoId,
          parcela: i + 1,
          totalParcelas: total,
          valorCentavos: repeticao.valores[i],
          vencimento: data,
          observacoes: observacoes || null,
          usuarioId: usuario.id,
        },
      }),
    ),
  );

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_receber',
    entidadeId: grupoId ?? descricao,
    acao: 'criou',
    resumo: `Conta a receber "${descricao}" — ${total} vencimento(s)`,
  });

  revalidarFinanceiro();
  redirect('/financeiro/receber');
}

export async function receberConta(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();
  const id = texto(form, 'id');

  const conta = await db.contaReceber.findFirst({
    where: { id, empresaId: usuario.empresaId },
    include: { cliente: { select: { nome: true } } },
  });
  if (!conta) return { erro: 'Conta não encontrada. Recarregue a página.' };
  if (conta.situacao !== 'aberta') return { erro: 'Esta conta já não está em aberto. Recarregue a página.' };

  const campos: Record<string, string> = {};
  const data = dataDoPagamento(texto(form, 'data'), campos);
  const valor = reaisParaCentavos(texto(form, 'valor'));
  const forma = texto(form, 'forma');
  if (valor === null || valor <= 0) campos.valor = 'Informe quanto recebeu, como 1.250,00.';
  if (!(forma in FORMAS_PAGAMENTO)) campos.forma = 'Escolha como recebeu.';
  if (Object.keys(campos).length > 0 || !data || !valor) return { erro: 'Confira os campos marcados.', campos };

  const parcela = conta.totalParcelas > 1 ? ` (${conta.parcela}/${conta.totalParcelas})` : '';

  await db.$transaction(async (tx) => {
    await lancarCaixa(
      {
        empresaId: usuario.empresaId,
        tipo: 'entrada',
        valorCentavos: valor,
        descricao: `${conta.descricao}${parcela}`,
        categoria: 'recebimento',
        // Recebimento de venda conta para a frente que vendeu.
        frente: ehFrente(conta.frente) ? conta.frente : null,
        origemTipo: 'conta_receber',
        origemId: conta.id,
        data,
        usuarioId: usuario.id,
      },
      tx,
    );
    await tx.contaReceber.update({
      where: { id: conta.id },
      data: { situacao: 'recebida', recebidoEm: data, valorRecebidoCentavos: valor, formaPagamento: forma },
    });
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_receber',
    entidadeId: conta.id,
    acao: 'alterou',
    resumo: `Recebeu "${conta.descricao}${parcela}" — ${centavosParaReais(valor)}`,
  });

  revalidarFinanceiro();
  return { ok: 'Recebimento lançado no caixa.' };
}

export async function cancelarContaReceber(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();
  const id = texto(form, 'id');
  const motivo = texto(form, 'motivo');

  if (motivo.length < 3) return { erro: 'Conte por que este valor não vai entrar.', campos: { motivo: 'Motivo obrigatório.' } };

  const conta = await db.contaReceber.findFirst({ where: { id, empresaId: usuario.empresaId } });
  if (!conta || conta.situacao !== 'aberta') return { erro: 'Só dá para cancelar conta em aberto. Recarregue a página.' };

  await db.contaReceber.update({
    where: { id: conta.id },
    data: { situacao: 'cancelada', motivoCancelamento: motivo },
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_receber',
    entidadeId: conta.id,
    acao: 'anulou',
    resumo: `Cancelou "${conta.descricao}": ${motivo}`,
  });

  revalidarFinanceiro();
  return { ok: 'Conta cancelada.' };
}

export async function desfazerRecebimento(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();
  const id = texto(form, 'id');
  const motivo = texto(form, 'motivo');

  if (motivo.length < 3) return { erro: 'Conte o que aconteceu para desfazer.', campos: { motivo: 'Motivo obrigatório.' } };

  const conta = await db.contaReceber.findFirst({ where: { id, empresaId: usuario.empresaId } });
  if (!conta || conta.situacao !== 'recebida' || !conta.valorRecebidoCentavos) {
    return { erro: 'Só dá para desfazer conta recebida. Recarregue a página.' };
  }

  await db.$transaction(async (tx) => {
    await lancarCaixa(
      {
        empresaId: usuario.empresaId,
        tipo: 'saida',
        valorCentavos: conta.valorRecebidoCentavos!,
        descricao: `Estorno de "${conta.descricao}": ${motivo}`,
        origemTipo: 'estorno',
        origemId: conta.id,
        usuarioId: usuario.id,
      },
      tx,
    );
    await tx.contaReceber.update({
      where: { id: conta.id },
      data: { situacao: 'aberta', recebidoEm: null, valorRecebidoCentavos: null, formaPagamento: null },
    });
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'conta_receber',
    entidadeId: conta.id,
    acao: 'ajustou',
    resumo: `Desfez recebimento de "${conta.descricao}": ${motivo}`,
  });

  revalidarFinanceiro();
  return { ok: 'Recebimento desfeito. A conta voltou para em aberto.' };
}

// ───────────────────────────────────────────────────────────── caixa

/** Dinheiro que entrou ou saiu sem conta por tras: sinal de pedido, retirada, compra no balcao. */
export async function lancarAvulso(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();

  const tipo = texto(form, 'tipo') === 'entrada' ? 'entrada' : 'saida';
  const categoria = texto(form, 'categoria');
  const descricao = texto(form, 'descricao');
  const valor = reaisParaCentavos(texto(form, 'valor'));

  const campos: Record<string, string> = {};
  const lista = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
  if (!(categoria in lista)) campos.categoria = tipo === 'entrada' ? 'Escolha de onde veio.' : 'Escolha para onde foi.';
  if (descricao.length < 2) campos.descricao = 'Escreva em poucas palavras o que foi.';
  if (valor === null || valor <= 0) campos.valor = 'Informe o valor, como 150,00.';
  const data = dataDoPagamento(texto(form, 'data'), campos);
  if (Object.keys(campos).length > 0 || !data || !valor) return { erro: 'Confira os campos marcados.', campos };

  const lancamento = await lancarCaixa({
    empresaId: usuario.empresaId,
    tipo,
    valorCentavos: valor,
    descricao,
    categoria,
    origemTipo: 'manual',
    data,
    usuarioId: usuario.id,
  });

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'caixa',
    entidadeId: lancamento.id,
    acao: 'criou',
    resumo: `${tipo === 'entrada' ? 'Entrada' : 'Saída'} avulsa "${descricao}" — ${centavosParaReais(valor)}`,
  });

  revalidarFinanceiro();
  redirect('/financeiro');
}

/**
 * Ela conta o que a empresa tem (gaveta + banco). Na primeira vez isso e
 * o saldo de abertura; depois, a diferenca vira ajuste com motivo — o
 * saldo antigo nunca e sobrescrito, igual a contagem de estoque.
 */
export async function conferirCaixa(_e: Resultado, form: FormData): Promise<Resultado> {
  const usuario = await exigirDona();

  const contado = reaisParaCentavos(texto(form, 'valor'));
  const motivo = texto(form, 'motivo');
  if (contado === null) {
    return { erro: 'Confira o campo marcado.', campos: { valor: 'Informe quanto a empresa tem agora, como 4.800,00.' } };
  }

  const [abriu, saldo] = await Promise.all([temAbertura(usuario.empresaId), saldoCaixa(usuario.empresaId)]);
  const diferenca = contado - saldo;

  if (abriu && diferenca === 0) return { ok: 'Bateu: o caixa tem exatamente o que o sistema mostra.' };
  if (abriu && motivo.length < 3) {
    return {
      erro: `O sistema mostra ${centavosParaReais(saldo)}. A diferença de ${centavosParaReais(Math.abs(diferenca))} só entra com motivo.`,
      campos: { motivo: 'Conte o que aconteceu, como "troco dado a mais" ou "tarifa do banco".' },
    };
  }

  if (diferenca !== 0) {
    await lancarCaixa({
      empresaId: usuario.empresaId,
      tipo: diferenca > 0 ? 'entrada' : 'saida',
      valorCentavos: Math.abs(diferenca),
      descricao: abriu
        ? `Conferência: ${motivo}`
        : `Saldo de abertura: a empresa tinha ${centavosParaReais(contado)}`,
      origemTipo: abriu ? 'ajuste' : 'abertura',
      usuarioId: usuario.id,
    });
  }

  await registrarAuditoria({
    empresaId: usuario.empresaId,
    usuarioId: usuario.id,
    entidade: 'caixa',
    entidadeId: usuario.empresaId,
    acao: abriu ? 'ajustou' : 'abriu',
    resumo: abriu
      ? `Conferiu o caixa: ${centavosParaReais(contado)} (diferença ${centavosParaReais(diferenca)}) — ${motivo}`
      : `Abriu o caixa com ${centavosParaReais(contado)}`,
  });

  revalidarFinanceiro();
  redirect('/financeiro');
}
