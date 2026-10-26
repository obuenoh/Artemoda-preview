import { exigirPapel } from '@/lib/sessao';
import { resumoVendas, vendasPorDia, rankingClientes, produtosMaisVendidos } from '@/lib/vendas';
import { ehFrente, FRENTES, LISTA_FRENTES } from '@/lib/frentes';
import { TituloPagina } from '@/components/Ui';
import { Dinheiro, BotaoOcultar } from '@/components/Valores';
import { GraficoVendas } from '@/components/GraficoVendas';
import { SeletorFrente } from '@/components/SeletorFrente';
import { SeletorPeriodo } from '../../SeletorPeriodo';

export const metadata = { title: 'Resumo de vendas' };

function calcularPeriodo(periodo: string, inicioParam?: string, fimParam?: string) {
  const fimHoje = new Date();
  fimHoje.setHours(23, 59, 59, 999);

  if (periodo === 'personalizado' && inicioParam && fimParam) {
    return { inicio: new Date(`${inicioParam}T00:00:00`), fim: new Date(`${fimParam}T23:59:59`) };
  }

  if (periodo === 'mes') {
    const agora = new Date();
    return { inicio: new Date(agora.getFullYear(), agora.getMonth(), 1), fim: fimHoje };
  }

  const dias = periodo === 'hoje' ? 0 : periodo === '7d' ? 6 : 29;
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - dias);
  inicio.setHours(0, 0, 0, 0);

  return { inicio, fim: fimHoje };
}

/** Quanto vendeu, para quem e o que mais saiu — de cada frente ou da empresa toda. */
export default async function ResumoVendasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string; frente?: string }>;
}) {
  const { periodo = '30d', inicio: inicioParam, fim: fimParam, frente: frenteParam } = await searchParams;
  const usuario = await exigirPapel('dona', 'vendas');
  const { inicio, fim } = calcularPeriodo(periodo, inicioParam, fimParam);
  const frente = ehFrente(frenteParam) ? frenteParam : undefined;

  const [resumo, porDia, clientes, maisVendidos] = await Promise.all([
    resumoVendas(usuario.empresaId, inicio, fim, frente),
    vendasPorDia(usuario.empresaId, inicio, fim, frente),
    rankingClientes(usuario.empresaId, inicio, fim, frente),
    produtosMaisVendidos(usuario.empresaId, inicio, fim, 6, frente),
  ]);

  const ticketMedio = resumo.quantidadeVendas > 0 ? Math.round(resumo.totalCentavos / resumo.quantidadeVendas) : 0;
  const deQuem = frente ? ` · ${FRENTES[frente]}` : '';

  return (
    <>
      <TituloPagina
        titulo="Resumo de vendas"
        sub="Quanto vendeu, para quem e o que mais saiu"
        acao={
          <div className="flex flex-wrap items-center gap-2">
            <SeletorPeriodo padrao="30d" />
            <BotaoOcultar />
          </div>
        }
      />

      <div className="mt-5">
        <SeletorFrente />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Numero rotulo={`Vendido no período${deQuem}`} nota={`${resumo.quantidadeVendas} venda(s)`}>
          <Dinheiro centavos={resumo.totalCentavos} />
        </Numero>
        <Numero rotulo={`Ticket médio${deQuem}`} nota="Por venda, no período">
          <Dinheiro centavos={ticketMedio} />
        </Numero>
        <div className="cartao">
          <p className="rotulo-campo">Por frente</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {LISTA_FRENTES.map((f) => (
              <li key={f} className={`flex justify-between gap-3 ${frente && frente !== f ? 'fraco' : ''}`}>
                <span className={frente === f ? 'font-semibold' : ''}>{FRENTES[f]}</span>
                <Dinheiro centavos={resumo.porFrente[f]} className="font-semibold tabular-nums" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {porDia.length > 1 && (
        <section className="mt-9">
          <h2 className="text-rotulo font-bold uppercase text-gold">Vendas por dia{deQuem}</h2>
          <div className="mt-3">
            <GraficoVendas pontos={porDia} />
          </div>
        </section>
      )}

      <div className="mt-9 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-rotulo font-bold uppercase text-gold">Maiores clientes{deQuem}</h2>
          <Ranking linhas={clientes.map((c) => ({ chave: c.clienteId ?? c.nome, nome: c.nome, detalhe: `${c.vendas} venda(s)`, centavos: c.totalCentavos }))} />
        </section>
        <section>
          <h2 className="text-rotulo font-bold uppercase text-gold">Peças mais vendidas{deQuem}</h2>
          <Ranking linhas={maisVendidos.map((p) => ({ chave: p.nome, nome: p.nome, detalhe: `${p.quantidade} peça(s)`, centavos: p.totalCentavos }))} />
        </section>
      </div>
    </>
  );
}

function Numero({ rotulo, nota, children }: { rotulo: string; nota: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cartao">
      <p className="rotulo-campo">{rotulo}</p>
      <p className="mt-2 text-2xl font-bold">{children}</p>
      <p className="mt-1 text-sm fraco">{nota}</p>
    </div>
  );
}

function Ranking({ linhas }: { linhas: { chave: string; nome: string; detalhe: string; centavos: number }[] }) {
  if (linhas.length === 0) {
    return (
      <p className="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">Nenhuma venda neste período.</p>
    );
  }
  return (
    <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
      {linhas.slice(0, 6).map((l) => (
        <li key={l.chave} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
          <span className="font-semibold">{l.nome}</span>
          <span className="fraco">{l.detalhe}</span>
          <Dinheiro centavos={l.centavos} className="ml-auto font-semibold" />
        </li>
      ))}
    </ul>
  );
}
