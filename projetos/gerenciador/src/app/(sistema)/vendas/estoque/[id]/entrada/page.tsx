import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { estadoProduto } from '@/lib/produtos';
import { TituloPagina } from '@/components/Ui';
import { FormEntrada } from './FormEntrada';

export const metadata = { title: 'Entrada de produção' };

export default async function EntradaProducaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirPapel('dona', 'vendas', 'producao');

  const produto = await db.produtoAcabado.findFirst({ where: { id, empresaId: usuario.empresaId } });
  if (!produto) notFound();

  const estado = await estadoProduto(produto.id);

  return (
    <>
      <TituloPagina
        titulo={`Entrada — ${produto.nome}`}
        sub={[produto.tamanho, produto.cor].filter(Boolean).join(' · ') || undefined}
      />
      <p className="mt-4 text-sm fraco">Tem {estado.saldo} peça(s) na loja agora.</p>
      <FormEntrada produtoAcabadoId={produto.id} />
    </>
  );
}
