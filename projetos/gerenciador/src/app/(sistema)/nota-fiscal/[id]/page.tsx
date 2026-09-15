import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { centavosParaReais, centavosNumero, dataBR } from '@/lib/numeros';
import { TituloPagina, Aviso } from '@/components/Ui';

export const metadata = { title: 'Rascunho de nota' };

export default async function NotaFiscalDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirPapel('dona');

  const nota = await db.notaFiscal.findFirst({
    where: { id, empresaId: usuario.empresaId },
    include: {
      cliente: true,
      vendas: { include: { venda: { include: { cliente: true, itens: true } } } },
    },
  });
  if (!nota) notFound();

  return (
    <>
      <Link href="/nota-fiscal" className="compacto text-rotulo font-bold uppercase text-gold">
        ← Nota Fiscal
      </Link>

      <div className="mt-3">
        <TituloPagina
          titulo={`Rascunho — ${dataBR(nota.periodoInicio)} a ${dataBR(nota.periodoFim)}`}
          sub={nota.cliente?.nome ?? 'Todos os clientes'}
        />
      </div>

      <Aviso tom="alerta">
        <strong>Isto é um rascunho, não é um documento fiscal.</strong> A emissão real depende de
        integrar um provedor homologado — ainda não configurado. Guarde este rascunho como
        referência até a parte fiscal ser ligada.
      </Aviso>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-fio bg-cream-alt p-4">
          <dt className="text-rotulo font-semibold uppercase fraco">Total das vendas</dt>
          <dd className="mt-1 text-xl font-bold">{centavosParaReais(nota.totalVendasCentavos)}</dd>
        </div>
        <div className="rounded border border-fio bg-cream-alt p-4">
          <dt className="text-rotulo font-semibold uppercase fraco">Desconto</dt>
          <dd className="mt-1 text-xl font-bold">
            {nota.descontoPercentualCem > 0 && `${centavosNumero(nota.descontoPercentualCem).replace(/,00$/, '')}% `}
            {nota.descontoValorCentavos > 0 && `+ ${centavosParaReais(nota.descontoValorCentavos)}`}
            {nota.descontoPercentualCem === 0 && nota.descontoValorCentavos === 0 && (
              <span className="fraco">Nenhum</span>
            )}
          </dd>
        </div>
        <div className="rounded border border-fio bg-navy-deep p-4 text-cream">
          <dt className="text-rotulo font-semibold uppercase text-[color:var(--texto-claro)]">
            Total com desconto
          </dt>
          <dd className="mt-1 text-xl font-bold">{centavosParaReais(nota.totalComDescontoCentavos)}</dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="text-rotulo font-bold uppercase text-gold">Vendas incluídas</h2>
        <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
          {nota.vendas.map((nv) => (
            <li key={nv.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
              <span className="font-semibold">{dataBR(nv.venda.criadoEm)}</span>
              <span className="fraco">{nv.venda.cliente?.nome ?? 'Balcão'}</span>
              <span className="ml-auto font-semibold">{centavosParaReais(nv.venda.totalCentavos)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
