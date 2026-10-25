import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoEstoque } from '@/lib/estoque';
import { milFormatado } from '@/lib/numeros';
import { TituloPagina, FaixaTotal, Vazio, Botao } from '@/components/Ui';
import { Dinheiro, BotaoOcultar } from '@/components/Valores';

export const metadata = { title: 'Estoque parado' };

/** Faixas de tempo parado, da mais preocupante para a mais nova. */
const FAIXAS = [
  { chave: 'ano', rotulo: 'Mais de 1 ano', de: 366, ate: Infinity },
  { chave: 'seis', rotulo: '6 meses a 1 ano', de: 181, ate: 365 },
  { chave: 'tres', rotulo: '3 a 6 meses', de: 91, ate: 180 },
  { chave: 'novo', rotulo: 'Menos de 3 meses', de: 0, ate: 90 },
] as const;

/**
 * A pergunta que a dona nao conseguia responder: quanto dinheiro esta
 * dormindo na prateleira? Total, por tipo (tecido, retalho, aviamento) e
 * por tempo parado — e a lista do mais antigo para o mais novo.
 */
export default async function EstoqueParadoPage() {
  const usuario = await exigirUsuario();
  const linhas = (await posicaoEstoque(usuario.empresaId))
    .filter((l) => l.saldoMil > 0)
    .sort((a, b) => (b.diasParado ?? 0) - (a.diasParado ?? 0));

  const total = linhas.reduce((s, l) => s + l.valorCentavos, 0);

  const porTipo = new Map<string, number>();
  for (const l of linhas) porTipo.set(l.tipoProdutoNome, (porTipo.get(l.tipoProdutoNome) ?? 0) + l.valorCentavos);
  const tipos = [...porTipo.entries()].sort((a, b) => b[1] - a[1]);

  const porFaixa = FAIXAS.map((f) => {
    const itens = linhas.filter((l) => {
      const d = l.diasParado ?? 0;
      return d >= f.de && d <= f.ate;
    });
    return { ...f, itens: itens.length, centavos: itens.reduce((s, l) => s + l.valorCentavos, 0) };
  });
  const maisDeSeisMeses = porFaixa.filter((f) => f.de > 180).reduce((s, f) => s + f.centavos, 0);

  return (
    <>
      <TituloPagina
        titulo="O que está parado"
        sub="Quanto dinheiro está dormindo na prateleira, do mais antigo para o mais novo"
        acao={<BotaoOcultar />}
      />

      {linhas.length === 0 ? (
        <Vazio
          titulo="Nada anotado no estoque."
          texto="Anote o que já está na prateleira (Estoque → Novo produto, com a quantidade) e os retalhos. Daí o app mostra quanto dinheiro está parado."
          acao={<Botao href="/estoque/retalhos">Anotar retalhos</Botao>}
        />
      ) : (
        <>
          <FaixaTotal>
            <span className="text-sm text-[color:var(--texto-claro)]">Você tem</span>
            <span className="text-2xl font-bold">
              <Dinheiro centavos={total} />
            </span>
            <span className="text-sm text-[color:var(--texto-claro)]">parados no estoque</span>
            {maisDeSeisMeses > 0 && (
              <span className="text-sm text-[color:var(--texto-claro)]">
                · <strong className="text-cream"><Dinheiro centavos={maisDeSeisMeses} /></strong> sem mexer há mais de 6 meses
              </span>
            )}
          </FaixaTotal>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="text-rotulo font-bold uppercase text-gold">Por tempo parado</h2>
              <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
                {porFaixa.map((f) => (
                  <li key={f.chave} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span className={f.de > 180 && f.centavos > 0 ? 'font-semibold text-alerta' : ''}>{f.rotulo}</span>
                    <span className="fraco">{f.itens} item(ns)</span>
                    <Dinheiro centavos={f.centavos} className="inline-block w-[120px] text-right font-semibold tabular-nums" />
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-rotulo font-bold uppercase text-gold">Por tipo</h2>
              <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
                {tipos.map(([nome, centavos]) => (
                  <li key={nome} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span>{nome}</span>
                    <span className="fraco">{Math.round((centavos * 100) / Math.max(total, 1))}%</span>
                    <Dinheiro centavos={centavos} className="inline-block w-[120px] text-right font-semibold tabular-nums" />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <h2 className="mt-9 text-rotulo font-bold uppercase text-gold">Item por item</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {linhas.map((l) => {
              const dias = l.diasParado ?? 0;
              const grave = dias > 180;
              return (
                <li
                  key={l.id}
                  className={`flex flex-wrap items-center gap-x-5 gap-y-2 rounded border px-4 py-4 ${
                    grave ? 'border-alerta bg-alerta/5' : 'border-fio'
                  }`}
                >
                  <div className="min-w-[180px] flex-1">
                    <p className="font-semibold">
                      {l.nome} {l.cor && <span className="fraco">· {l.cor}</span>}
                    </p>
                    <p className="miudo">
                      {l.tipoProdutoNome} · {milFormatado(l.saldoMil, l.unidade)}
                      {l.localizacao && ` · ${l.localizacao}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${grave ? 'text-alerta' : ''}`}>{dias} dias</p>
                    <p className="miudo">parado</p>
                  </div>

                  <div className="min-w-[110px] text-right">
                    <p className="font-bold">
                      <Dinheiro centavos={l.valorCentavos} />
                    </p>
                    <p className="miudo">em dinheiro</p>
                  </div>

                  <Link href={`/estoque/${l.id}`} className="compacto text-rotulo font-bold uppercase text-gold">
                    Extrato →
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
