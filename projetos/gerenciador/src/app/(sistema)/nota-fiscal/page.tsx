import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { centavosParaReais, dataBR } from '@/lib/numeros';
import { TituloPagina, Aviso, Vazio } from '@/components/Ui';
import { FiltroNota } from './FiltroNota';

export const metadata = { title: 'Nota Fiscal' };

export default async function NotaFiscalPage() {
  const usuario = await exigirPapel('dona');

  const [clientes, notas] = await Promise.all([
    db.cliente.findMany({
      where: { empresaId: usuario.empresaId, ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true },
    }),
    db.notaFiscal.findMany({
      where: { empresaId: usuario.empresaId },
      orderBy: { criadoEm: 'desc' },
      take: 20,
      include: { cliente: { select: { nome: true } } },
    }),
  ]);

  return (
    <>
      <TituloPagina
        titulo="Nota Fiscal"
        sub="Relatório de vendas por período, com desconto — e a nota em rascunho"
      />

      <Aviso>
        Esta tela ainda não emite nota fiscal de verdade. Falta a definição do contador (regime,
        certificado, CFOP) e a ligação com um provedor homologado. Por enquanto ela calcula o
        relatório certo e deixa a nota pronta em <strong>rascunho</strong> — no dia em que a parte
        fiscal for ligada, é só emitir a partir daqui.
      </Aviso>

      <div className="mt-6">
        <FiltroNota clientes={clientes} />
      </div>

      <section className="mt-10">
        <h2 className="text-rotulo font-bold uppercase fraco">Notas em rascunho</h2>

        {notas.length === 0 ? (
          <Vazio
            titulo="Nenhuma nota gerada ainda."
            texto="Escolha um período acima e gere o relatório ou o rascunho da nota."
          />
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
            {notas.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <Link href={`/nota-fiscal/${n.id}`} className="compacto font-semibold">
                  {dataBR(n.periodoInicio)} a {dataBR(n.periodoFim)}
                </Link>
                <span className="fraco">{n.cliente?.nome ?? 'Todos os clientes'}</span>
                <span className="selo selo-neutro">Rascunho</span>
                <span className="ml-auto font-semibold">
                  {centavosParaReais(n.totalComDescontoCentavos)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
