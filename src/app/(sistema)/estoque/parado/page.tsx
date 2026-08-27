import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoEstoque } from '@/lib/estoque';
import { centavosParaReais, milFormatado } from '@/lib/numeros';
import { TituloPagina, FaixaTotal, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Estoque parado' };

export default async function EstoqueParadoPage() {
  const usuario = await exigirUsuario();
  const linhas = (await posicaoEstoque(usuario.empresaId))
    .filter((l) => l.saldoMil > 0)
    .sort((a, b) => (b.diasParado ?? 0) - (a.diasParado ?? 0));

  const total = linhas.reduce((s, l) => s + l.valorCentavos, 0);
  const longo = linhas.filter((l) => (l.diasParado ?? 0) > 180);
  const totalLongo = longo.reduce((s, l) => s + l.valorCentavos, 0);

  return (
    <>
      <TituloPagina
        titulo="O que está parado"
        sub="Quanto dinheiro está dormindo na prateleira, do mais antigo para o mais novo"
        acao={<Botao href="/estoque" variante="vazio">Voltar ao estoque</Botao>}
      />

      {linhas.length === 0 ? (
        <Vazio titulo="Nada em estoque." texto="Quando houver tecido na prateleira, ele aparece aqui ordenado por tempo parado." />
      ) : (
        <>
          <FaixaTotal>
            <span className="text-sm text-[color:var(--texto-claro)]">Você tem</span>
            <span className="text-2xl font-bold">{centavosParaReais(total)}</span>
            <span className="text-sm text-[color:var(--texto-claro)]">parados em tecido</span>
            {totalLongo > 0 && (
              <span className="text-sm text-[color:var(--texto-claro)]">
                — sendo <strong className="text-cream">{centavosParaReais(totalLongo)}</strong> há
                mais de 180 dias
              </span>
            )}
          </FaixaTotal>

          <ul className="mt-6 flex flex-col gap-2">
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
                      {milFormatado(l.saldoMil, l.unidade)}
                      {l.localizacao && ` · ${l.localizacao}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${grave ? 'text-alerta' : ''}`}>{dias} dias</p>
                    <p className="miudo">sem movimento</p>
                  </div>

                  <div className="min-w-[110px] text-right">
                    <p className="font-bold">{centavosParaReais(l.valorCentavos)}</p>
                    <p className="miudo">parado</p>
                  </div>

                  <Link
                    href={`/estoque/${l.id}`}
                    className="compacto text-rotulo font-bold uppercase text-gold"
                  >
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
