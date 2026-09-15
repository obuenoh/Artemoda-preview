import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoEstoque } from '@/lib/estoque';
import { resumoVendas, vendasPorDia, rankingClientes, produtosMaisVendidos } from '@/lib/vendas';
import { centavosParaReais, milFormatado, dataCurtaBR } from '@/lib/numeros';
import { SeletorPeriodo } from './SeletorPeriodo';

export const metadata = { title: 'Visão Geral' };

function calcularPeriodo(periodo: string, inicioParam?: string, fimParam?: string) {
  const fimHoje = new Date();
  fimHoje.setHours(23, 59, 59, 999);

  if (periodo === 'personalizado' && inicioParam && fimParam) {
    return { inicio: new Date(`${inicioParam}T00:00:00`), fim: new Date(`${fimParam}T23:59:59`) };
  }

  const dias = periodo === '30d' ? 29 : periodo === '7d' ? 6 : 0;
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - dias);
  inicio.setHours(0, 0, 0, 0);

  return { inicio, fim: fimHoje };
}

/**
 * A primeira tela e "o que eu preciso saber agora", nao um monte de
 * grafico. Cada cartao leva para a tela onde aquilo se resolve.
 */
export default async function VisaoGeralPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string }>;
}) {
  const { periodo = 'hoje', inicio: inicioParam, fim: fimParam } = await searchParams;
  const usuario = await exigirUsuario();
  const { inicio, fim } = calcularPeriodo(periodo, inicioParam, fimParam);

  const [estoque, resumo, porDia, clientesProducao, clientesLoja, maisVendidos] = await Promise.all([
    posicaoEstoque(usuario.empresaId),
    resumoVendas(usuario.empresaId, inicio, fim),
    vendasPorDia(usuario.empresaId, inicio, fim),
    rankingClientes(usuario.empresaId, inicio, fim, 'producao'),
    rankingClientes(usuario.empresaId, inicio, fim, 'loja'),
    produtosMaisVendidos(usuario.empresaId, inicio, fim),
  ]);

  const abaixo = estoque.filter((l) => l.abaixoDoMinimo);
  const capital = estoque.reduce((s, l) => s + l.valorCentavos, 0);
  const paradoLongo = estoque
    .filter((l) => (l.diasParado ?? 0) > 180)
    .reduce((s, l) => s + l.valorCentavos, 0);

  const maiorDia = Math.max(1, ...porDia.map((p) => p.totalCentavos));
  const ticketMedio = resumo.quantidadeVendas > 0 ? Math.round(resumo.totalCentavos / resumo.quantidadeVendas) : 0;

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-fio pb-5">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Visão Geral</h1>
          <p className="mt-1 text-sm capitalize fraco">{hoje}</p>
        </div>
        <SeletorPeriodo />
      </div>

      {/* ── vendas do período ─────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao rotulo="Vendido no período" numero={centavosParaReais(resumo.totalCentavos)} nota={`${resumo.quantidadeVendas} venda(s)`} href="/vendas" acao="Ir para Vendas" />
        <Cartao
          rotulo="Loja x Produção"
          numero={centavosParaReais(resumo.totalLojaCentavos)}
          nota={`Loja · ${centavosParaReais(resumo.totalProducaoCentavos)} produção`}
          href="/vendas"
          acao="Ver vendas"
        />
        <Cartao rotulo="Ticket médio" numero={centavosParaReais(ticketMedio)} nota="Por venda, no período" href="/vendas" acao="Ir para Vendas" />
        <Cartao
          rotulo="Tecido/aviamento abaixo do mínimo"
          numero={abaixo.length > 0 ? String(abaixo.length) : '—'}
          grave={abaixo.length > 0}
          nota={abaixo.length > 0 ? abaixo.map((l) => l.nome).slice(0, 3).join(', ') : 'Tudo acima do mínimo definido.'}
          href="/estoque"
          acao="Ver o que comprar"
        />
      </div>

      {/* ── grafico simples de vendas por dia ─────────────────────── */}
      {porDia.length > 1 && (
        <section className="mt-9">
          <h2 className="text-rotulo font-bold uppercase text-gold">Vendas por dia</h2>
          <div className="tabela-rolagem mt-3">
            <div className="flex min-w-[480px] items-end gap-1.5 rounded border border-fio bg-cream-alt p-4" style={{ height: 160 }}>
              {porDia.map((p) => (
                <div key={p.dia} className="flex flex-1 flex-col items-center justify-end gap-1.5" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-sm bg-gold"
                    style={{ height: `${Math.max(4, (p.totalCentavos / maiorDia) * 100)}%` }}
                    title={centavosParaReais(p.totalCentavos)}
                  />
                  <span className="text-[9px] fraco">{dataCurtaBR(new Date(`${p.dia}T12:00:00`))}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── quem mais compra ──────────────────────────────────────── */}
      <div className="mt-9 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-rotulo font-bold uppercase text-gold">Maiores clientes — produção</h2>
          <RankingClientes linhas={clientesProducao} />
        </section>
        <section>
          <h2 className="text-rotulo font-bold uppercase text-gold">Maiores clientes — loja</h2>
          <RankingClientes linhas={clientesLoja} />
        </section>
      </div>

      {maisVendidos.length > 0 && (
        <section className="mt-9">
          <h2 className="text-rotulo font-bold uppercase fraco">Peças mais vendidas</h2>
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
            {maisVendidos.map((p) => (
              <li key={p.nome} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <span className="font-semibold">{p.nome}</span>
                <span className="fraco">{p.quantidade} peça(s)</span>
                <span className="ml-auto font-semibold">{centavosParaReais(p.totalCentavos)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── estoque ────────────────────────────────────────────────── */}
      <section className="mt-9">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-rotulo font-bold uppercase fraco">Estoque</h2>
          <Link href="/estoque/parado" className="compacto text-rotulo font-bold uppercase text-gold">
            {centavosParaReais(capital)} parado no total →
          </Link>
        </div>

        {abaixo.length > 0 ? (
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
            {abaixo.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-semibold">
                    {l.nome} {l.cor && <span className="fraco">· {l.cor}</span>}
                  </p>
                  <p className="miudo">
                    Tem {milFormatado(l.saldoMil, l.unidade)} · mínimo {milFormatado(l.estoqueMinimoMil, l.unidade)}
                  </p>
                </div>
                <Link href={`/compras/nova?tecido=${l.id}`} className="bt bt-vazio compacto py-2">
                  Registrar compra
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">
            Nada abaixo do mínimo definido.
            {paradoLongo > 0 && ` ${centavosParaReais(paradoLongo)} parados há mais de 6 meses.`}
          </p>
        )}
      </section>
    </>
  );
}

function RankingClientes({
  linhas,
}: {
  linhas: { clienteId: string | null; nome: string; totalCentavos: number; vendas: number }[];
}) {
  if (linhas.length === 0) {
    return (
      <p className="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">
        Nenhuma venda neste período.
      </p>
    );
  }
  return (
    <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
      {linhas.slice(0, 6).map((c) => (
        <li key={c.clienteId ?? c.nome} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
          <span className="font-semibold">{c.nome}</span>
          <span className="fraco">{c.vendas} venda(s)</span>
          <span className="ml-auto font-semibold">{centavosParaReais(c.totalCentavos)}</span>
        </li>
      ))}
    </ul>
  );
}

function Cartao({
  rotulo,
  numero,
  nota,
  href,
  acao,
  grave = false,
}: {
  rotulo: string;
  numero: string;
  nota: string;
  href: string;
  acao: string;
  grave?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-2 rounded border bg-cream-alt p-4 transition-colors hover:border-gold ${
        grave ? 'border-alerta' : 'border-fio'
      }`}
    >
      <p className="text-rotulo font-semibold uppercase fraco">{rotulo}</p>
      <p className={`text-2xl font-bold leading-tight ${grave ? 'text-alerta' : ''}`}>{numero}</p>
      <p className="text-sm fraco">{nota}</p>
      <p className="mt-auto pt-2 text-rotulo font-bold uppercase text-gold">{acao} →</p>
    </Link>
  );
}
