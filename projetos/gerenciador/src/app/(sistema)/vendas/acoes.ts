'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { exigirPapel, registrarAuditoria } from '@/lib/sessao';
import { lancarProduto, buscarPorSku, estadoProduto } from '@/lib/produtos';
import { lancarCaixa, parcelasDaCondicao } from '@/lib/financeiro';
import { DESCRICAO_VENDA, ehFrente, rotuloFrente, type Frente } from '@/lib/frentes';

// ─────────────────────────────────────────────── bipagem: busca por SKU

export type ProdutoEncontrado = {
  id: string;
  nome: string;
  tamanho: string | null;
  cor: string | null;
  sku: string;
  precoVendaCentavos: number;
  /** Saldo na frente que esta vendendo — e de la que a peca sai. */
  saldo: number;
};

/** Chamada direto do client a cada Enter no campo de bipagem. */
export async function buscarProdutoPorSku(sku: string, frente: Frente): Promise<ProdutoEncontrado | null> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');
  if (!ehFrente(frente)) return null;
  const produto = await buscarPorSku(usuario.empresaId, sku);
  if (!produto || !produto.ativo) return null;

  const estado = await estadoProduto(produto.id, frente);

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

const FORMAS = ['dinheiro', 'pix', 'cartao', 'fiado', 'mercado_livre'] as const;

/** Em quantos dias o Mercado Livre libera o dinheiro. Configuracao pendente: palpite de 30. */
async function prazoMercadoLivre(): Promise<number> {
  const c = await db.configuracao.findUnique({ where: { chave: 'prazo_repasse_mercado_livre_dias' } });
  const dias = Number(c?.valor);
  return Number.isInteger(dias) && dias >= 0 ? dias : 30;
}

/**
 * Recebe o carrinho pronto (montado no client a partir da bipagem) e faz
 * tudo numa transação: cria a venda, baixa cada peça do estoque DA FRENTE
 * que vendeu via lancarProduto (nunca UPDATE direto) e lança a entrada no
 * caixa — ou a conta a receber, quando o dinheiro ainda não entrou.
 */
export async function finalizarVenda(dados: {
  frente: Frente;
  clienteId: string | null;
  formaPagamento: string;
  observacoes: string;
  itens: CarrinhoItem[];
}): Promise<{ erro: string } | { ok: true; vendaId: string }> {
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  if (!ehFrente(dados.frente)) return { erro: 'Escolha o tipo de venda: balcão, pedido da fábrica ou e-commerce.' };
  if (dados.itens.length === 0) return { erro: 'Adicione ao menos uma peça antes de finalizar.' };
  if (dados.frente === 'fabrica' && !dados.clienteId) {
    return { erro: 'Pedido da fábrica precisa de um cliente: escola, empresa ou marca.' };
  }
  if (!(FORMAS as readonly string[]).includes(dados.formaPagamento)) return { erro: 'Escolha a forma de pagamento.' };

  const parsedItens = z.array(itemSchema).safeParse(dados.itens);
  if (!parsedItens.success) return { erro: 'Carrinho inválido — recarregue a página e tente de novo.' };

  const totalCentavos = parsedItens.data.reduce((s, i) => s + i.quantidade * i.precoUnitarioCentavos, 0);
  const diasMercadoLivre = dados.formaPagamento === 'mercado_livre' ? await prazoMercadoLivre() : 0;

  try {
    const vendaId = await db.$transaction(async (tx) => {
      const venda = await tx.venda.create({
        data: {
          empresaId: usuario.empresaId,
          clienteId: dados.clienteId,
          frente: dados.frente,
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
            frente: dados.frente,
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

      if (dados.formaPagamento === 'mercado_livre') {
        // O dinheiro fica com o Mercado Livre ate liberar: vira conta a receber.
        const vencimento = new Date(venda.criadoEm);
        vencimento.setDate(vencimento.getDate() + diasMercadoLivre);
        vencimento.setHours(12, 0, 0, 0);
        await tx.contaReceber.create({
          data: {
            empresaId: usuario.empresaId,
            descricao: `Mercado Livre${dados.observacoes ? ` — pedido ${dados.observacoes}` : ''}`,
            clienteId: dados.clienteId,
            vendaId: venda.id,
            frente: dados.frente,
            valorCentavos: totalCentavos,
            vencimento,
            usuarioId: usuario.id,
          },
        });
      } else if (dados.formaPagamento !== 'fiado') {
        await lancarCaixa(
          {
            empresaId: usuario.empresaId,
            tipo: 'entrada',
            origemTipo: 'venda',
            origemId: venda.id,
            frente: dados.frente,
            valorCentavos: totalCentavos,
            descricao: DESCRICAO_VENDA[dados.frente],
            usuarioId: usuario.id,
          },
          tx,
        );
      } else {
        // Fiado nao entrou no caixa: vira conta a receber, no prazo que o
        // cliente costuma pagar. Cliente "a vista" que levou fiado ganha 30 dias.
        const cliente = dados.clienteId
          ? await tx.cliente.findFirst({
              where: { id: dados.clienteId, empresaId: usuario.empresaId },
              select: { nome: true, condicaoPagamento: true },
            })
          : null;
        const condicao = cliente && cliente.condicaoPagamento !== 'a_vista' ? cliente.condicaoPagamento : '30';
        const parcelas = parcelasDaCondicao(condicao, venda.criadoEm, totalCentavos);
        const grupoId = parcelas.length > 1 ? randomUUID() : null;

        for (const [i, p] of parcelas.entries()) {
          await tx.contaReceber.create({
            data: {
              empresaId: usuario.empresaId,
              descricao: `Venda fiado — ${cliente?.nome ?? 'sem cliente'}`,
              clienteId: dados.clienteId,
              vendaId: venda.id,
              frente: dados.frente,
              grupoId,
              parcela: i + 1,
              totalParcelas: parcelas.length,
              valorCentavos: p.valorCentavos,
              vencimento: p.vencimento,
              usuarioId: usuario.id,
            },
          });
        }
      }

      return venda.id;
    });

    await registrarAuditoria({
      empresaId: usuario.empresaId,
      usuarioId: usuario.id,
      entidade: 'venda',
      entidadeId: vendaId,
      acao: 'criou',
      resumo: `Venda de ${parsedItens.data.length} item(ns) — ${rotuloFrente(dados.frente)}`,
    });

    revalidatePath('/vendas', 'layout');
    revalidatePath('/pecas', 'layout');
    revalidatePath('/financeiro', 'layout');
    revalidatePath('/');
    return { ok: true, vendaId };
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Não foi possível registrar a venda.' };
  }
}
