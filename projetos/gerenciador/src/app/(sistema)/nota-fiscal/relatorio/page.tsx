import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { relatorioPeriodo } from '@/lib/notafiscal';
import { centavosParaReais, dataBR } from '@/lib/numeros';
import { BotaoImprimir } from './BotaoImprimir';

export const metadata = { title: 'Relatório de vendas' };

export default async function RelatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string; clienteId?: string }>;
}) {
  const { inicio, fim, clienteId } = await searchParams;
  const usuario = await exigirPapel('dona');

  if (!inicio || !fim) {
    return <p className="p-8 text-sm fraco">Período não informado.</p>;
  }

  const dataInicio = new Date(`${inicio}T00:00:00`);
  const dataFim = new Date(`${fim}T23:59:59`);

  const [relatorio, empresa, cliente] = await Promise.all([
    relatorioPeriodo(usuario.empresaId, dataInicio, dataFim, clienteId || undefined),
    db.empresa.findUnique({ where: { id: usuario.empresaId } }),
    clienteId ? db.cliente.findUnique({ where: { id: clienteId } }) : null,
  ]);

  return (
    <div className="mx-auto max-w-[760px] p-8 print:p-0">
      <div className="flex items-start justify-between border-b border-ink pb-4">
        <div>
          <p className="font-display text-2xl">{empresa?.nome ?? 'Arte e Moda'}</p>
          <p className="text-sm fraco">Relatório de vendas</p>
        </div>
        <BotaoImprimir />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-rotulo font-semibold uppercase fraco">Período</dt>
          <dd>
            {dataBR(dataInicio)} a {dataBR(dataFim)}
          </dd>
        </div>
        <div>
          <dt className="text-rotulo font-semibold uppercase fraco">Cliente</dt>
          <dd>{cliente?.nome ?? 'Todos'}</dd>
        </div>
        <div>
          <dt className="text-rotulo font-semibold uppercase fraco">Vendas</dt>
          <dd>{relatorio.itens.length}</dd>
        </div>
        <div>
          <dt className="text-rotulo font-semibold uppercase fraco">Peças</dt>
          <dd>{relatorio.totalPecas}</dd>
        </div>
      </dl>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="th">Data</th>
            <th className="th">Cliente</th>
            <th className="th">Canal</th>
            <th className="th">Peças</th>
            <th className="th">Total</th>
          </tr>
        </thead>
        <tbody>
          {relatorio.itens.map((i) => (
            <tr key={i.vendaId}>
              <td className="td">{dataBR(i.data)}</td>
              <td className="td">{i.clienteNome}</td>
              <td className="td">{i.canal === 'loja' ? 'Loja' : 'Produção'}</td>
              <td className="td">{i.pecas}</td>
              <td className="td font-semibold">{centavosParaReais(i.totalCentavos)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end border-t border-ink pt-4">
        <p className="text-xl font-bold">Total: {centavosParaReais(relatorio.totalCentavos)}</p>
      </div>

      <p className="mt-6 text-xs fraco print:hidden">
        Documento interno, sem valor fiscal — não substitui nota fiscal.
      </p>
    </div>
  );
}
