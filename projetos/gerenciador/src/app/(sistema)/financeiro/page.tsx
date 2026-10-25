import Link from 'next/link';
import { exigirPapel } from '@/lib/sessao';
import { dataCurtaBR } from '@/lib/numeros';
import { Dinheiro } from '@/components/Valores';
import { extrato, pendenciasFinanceiras, previsao, temAbertura } from '@/lib/financeiro';
import { TituloPagina, FaixaTotal, Aviso, Botao } from '@/components/Ui';

export const metadata = { title: 'Caixa' };

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "2026-10" vira o primeiro e o ultimo instante do mes, no horario local. */
function periodoDoMes(mes?: string) {
  const agora = new Date();
  const [ano, m] = mes && /^\d{4}-\d{2}$/.test(mes) ? mes.split('-').map(Number) : [agora.getFullYear(), agora.getMonth() + 1];
  const inicio = new Date(ano, m - 1, 1, 0, 0, 0, 0);
  const fim = new Date(ano, m, 0, 23, 59, 59, 999);
  const chave = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return {
    inicio,
    fim,
    rotulo: `${MESES[m - 1]} de ${ano}`,
    anterior: chave(new Date(ano, m - 2, 1)),
    seguinte: chave(new Date(ano, m, 1)),
    ehAtual: ano === agora.getFullYear() && m === agora.getMonth() + 1,
  };
}

/**
 * O caixa responde tres perguntas, nessa ordem: quanto tenho agora, o que
 * vem pela frente (e quando aperta), e para onde foi o dinheiro do mes.
 */
export default async function CaixaPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const usuario = await exigirPapel('dona');
  const { mes } = await searchParams;
  const periodo = periodoDoMes(mes);

  const [abriu, prev, ext, pend] = await Promise.all([
    temAbertura(usuario.empresaId),
    previsao(usuario.empresaId),
    extrato(usuario.empresaId, periodo.inicio, periodo.fim),
    pendenciasFinanceiras(usuario.empresaId),
  ]);

  const ultima = prev.semanas.at(-1);
  const resultado = ext.entradasCentavos - ext.saidasCentavos;

  return (
    <>
      <TituloPagina
        titulo="Caixa"
        sub="Quanto a empresa tem, o que vem pela frente e para onde foi o dinheiro"
        acao={
          <div className="flex flex-wrap gap-2">
            <Botao href="/financeiro/lancar?tipo=entrada" variante="vazio">
              + Entrada
            </Botao>
            <Botao href="/financeiro/lancar?tipo=saida" variante="vazio">
              − Saída
            </Botao>
            <Botao href="/financeiro/conferir" variante="vazio">
              Conferir o caixa
            </Botao>
          </div>
        }
      />

      {!abriu && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded border border-gold bg-cream-alt px-5 py-4">
          <p className="max-w-[60ch] text-sm">
            <strong>Comece dizendo quanto a empresa tem hoje</strong>, somando gaveta e banco. Sem isso o
            saldo mostra só o que passou pelo sistema, e não o dinheiro de verdade.
          </p>
          <Botao href="/financeiro/conferir">Informar o saldo de hoje</Botao>
        </div>
      )}

      <FaixaTotal>
        <span className="text-sm text-[color:var(--texto-claro)]">Saldo hoje</span>
        <span className="text-2xl font-bold">{<Dinheiro centavos={prev.saldoHojeCentavos} />}</span>
        {ultima && (
          <span className="text-sm text-[color:var(--texto-claro)]">
            Previsto para {dataCurtaBR(ultima.fim)}: <strong className="text-cream">{<Dinheiro centavos={ultima.saldoFimCentavos} />}</strong>
          </span>
        )}
      </FaixaTotal>

      {/* ── o que exige acao lidera ─────────────────────────────── */}
      {prev.primeiroNegativo && (
        <Aviso tom="alerta">
          <strong>Em {dataCurtaBR(prev.primeiroNegativo.dia)} o caixa fica negativo</strong> (
          {<Dinheiro centavos={prev.primeiroNegativo.saldoCentavos} />}) se nada mudar. Veja o que vence antes disso em{' '}
          <Link href="/financeiro/pagar" className="compacto font-semibold underline">
            A pagar
          </Link>{' '}
          ou cobre o que está para receber.
        </Aviso>
      )}
      {pend.pagarVencidas.quantidade > 0 && (
        <Aviso tom="alerta">
          <strong>
            {pend.pagarVencidas.quantidade} conta(s) vencida(s), {<Dinheiro centavos={pend.pagarVencidas.totalCentavos} />}.
          </strong>{' '}
          <Link href="/financeiro/pagar" className="compacto font-semibold underline">
            Ver contas a pagar
          </Link>
        </Aviso>
      )}
      {pend.receberAtrasadas.quantidade > 0 && (
        <Aviso>
          {pend.receberAtrasadas.quantidade} recebimento(s) atrasado(s), {<Dinheiro centavos={pend.receberAtrasadas.totalCentavos} />}.{' '}
          <Link href="/financeiro/receber" className="compacto font-semibold text-ink underline">
            Ver quem deve
          </Link>
        </Aviso>
      )}

      {/* ── proximas semanas ─────────────────────────────────────── */}
      <section className="mt-9">
        <h2 className="text-rotulo font-bold uppercase text-gold">Próximas semanas</h2>
        <p className="miudo mt-1">O que vence de contas a pagar e a receber. Conta atrasada conta como hoje.</p>
        <div className="tabela-rolagem mt-3">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th className="th">Semana</th>
                <th className="th text-right">Entra</th>
                <th className="th text-right">Sai</th>
                <th className="th text-right">Saldo no fim</th>
              </tr>
            </thead>
            <tbody>
              {prev.semanas.map((s, i) => (
                <tr key={s.inicio.toISOString()}>
                  <td className="td">
                    {i === 0 ? 'Esta semana' : `${dataCurtaBR(s.inicio)} a ${dataCurtaBR(s.fim)}`}
                  </td>
                  <td className="td text-right">{s.entraCentavos > 0 ? <Dinheiro centavos={s.entraCentavos} /> : '—'}</td>
                  <td className="td text-right">{s.saiCentavos > 0 ? <Dinheiro centavos={s.saiCentavos} /> : '—'}</td>
                  <td className={`td text-right font-semibold ${s.saldoFimCentavos < 0 ? 'text-alerta' : ''}`}>
                    {<Dinheiro centavos={s.saldoFimCentavos} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── o mes ────────────────────────────────────────────────── */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-rotulo font-bold uppercase text-gold">Movimento de {periodo.rotulo}</h2>
          <div className="flex gap-2">
            <Link href={`/financeiro?mes=${periodo.anterior}`} className="bt bt-vazio compacto py-2">
              ← Mês anterior
            </Link>
            {!periodo.ehAtual && (
              <Link href={`/financeiro?mes=${periodo.seguinte}`} className="bt bt-vazio compacto py-2">
                Mês seguinte →
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="cartao">
            <p className="rotulo-campo">Entrou</p>
            <p className="mt-2 text-xl font-bold">{<Dinheiro centavos={ext.entradasCentavos} />}</p>
          </div>
          <div className="cartao">
            <p className="rotulo-campo">Saiu</p>
            <p className="mt-2 text-xl font-bold">{<Dinheiro centavos={ext.saidasCentavos} />}</p>
          </div>
          <div className={`cartao ${resultado < 0 ? 'border-alerta' : ''}`}>
            <p className="rotulo-campo">Sobrou no mês</p>
            <p className={`mt-2 text-xl font-bold ${resultado < 0 ? 'text-alerta' : ''}`}>{<Dinheiro centavos={resultado} />}</p>
          </div>
        </div>

        {ext.saidasPorCategoria.length > 0 && (
          <div className="mt-6">
            <h3 className="text-rotulo font-bold uppercase fraco">Para onde foi</h3>
            <ul className="mt-2 divide-y divide-[color:var(--fio)] rounded border border-fio">
              {ext.saidasPorCategoria.map((c) => (
                <li key={c.categoria} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                  <span>{c.categoria}</span>
                  <span className="font-semibold tabular-nums">
                    {<Dinheiro centavos={c.totalCentavos} />}
                    <span className="ml-2 font-normal fraco">
                      {Math.round((c.totalCentavos * 100) / ext.saidasCentavos)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-rotulo font-bold uppercase fraco">Extrato</h3>
          {ext.linhas.length === 0 ? (
            <p className="mt-2 text-sm fraco">Nenhum movimento neste mês.</p>
          ) : (
            <div className="tabela-rolagem mt-2">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="th">Dia</th>
                    <th className="th">O que foi</th>
                    <th className="th">Tipo</th>
                    <th className="th text-right">Valor</th>
                    <th className="th text-right">Saldo depois</th>
                  </tr>
                </thead>
                <tbody>
                  {ext.linhas.map((l) => (
                    <tr key={l.id}>
                      <td className="td whitespace-nowrap">{dataCurtaBR(l.data)}</td>
                      <td className="td">{l.descricao}</td>
                      <td className="td fraco">{l.categoria}</td>
                      <td className={`td whitespace-nowrap text-right font-semibold ${l.tipo === 'entrada' ? 'text-ok' : ''}`}>
                        {l.tipo === 'entrada' ? '+' : '−'} {<Dinheiro centavos={l.valorCentavos} />}
                      </td>
                      <td className="td whitespace-nowrap text-right fraco">{<Dinheiro centavos={l.saldoAposCentavos} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="miudo mt-2">
            Começou o mês com {<Dinheiro centavos={ext.saldoInicialCentavos} />} e {periodo.ehAtual ? 'está com' : 'terminou com'}{' '}
            {<Dinheiro centavos={ext.saldoFinalCentavos} />}.
          </p>
        </div>
      </section>
    </>
  );
}
