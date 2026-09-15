import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { centavosParaReais, dataBR } from '@/lib/numeros';
import { TituloPagina, Botao } from '@/components/Ui';
import { PontoDeVenda } from './PontoDeVenda';

export const metadata = { title: 'Vendas' };

export default async function VendasPage() {
  const usuario = await exigirUsuario();

  const [clientes, ultimasVendas] = await Promise.all([
    db.cliente.findMany({
      where: { empresaId: usuario.empresaId, ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true },
    }),
    db.venda.findMany({
      where: { empresaId: usuario.empresaId },
      orderBy: { criadoEm: 'desc' },
      take: 12,
      include: { cliente: { select: { nome: true } }, itens: true },
    }),
  ]);

  return (
    <>
      <TituloPagina
        titulo="Vendas"
        sub="Bipe o código de barras ou digite o SKU — o estoque desconta sozinho"
        acao={
          <Botao href="/vendas/estoque" variante="vazio">
            Estoque da loja
          </Botao>
        }
      />

      <PontoDeVenda clientes={clientes} />

      <section className="mt-10">
        <h2 className="text-rotulo font-bold uppercase fraco">Últimas vendas</h2>

        {ultimasVendas.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">
            Nenhuma venda registrada ainda.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
            {ultimasVendas.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <span className="font-semibold">{dataBR(v.criadoEm)}</span>
                <span className="selo selo-neutro">{v.canal === 'loja' ? 'Loja' : 'Produção'}</span>
                <span className="fraco">{v.cliente?.nome ?? 'Balcão'}</span>
                <span className="fraco">
                  {v.itens.reduce((s, i) => s + i.quantidade, 0)} peça(s)
                </span>
                <span className="ml-auto font-semibold">{centavosParaReais(v.totalCentavos)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
