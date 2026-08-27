import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { centavosParaReais } from '@/lib/numeros';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Comparar preços' };

const unidadeCurta: Record<string, string> = { metro: 'metro', kg: 'kg', peca: 'peça' };

/**
 * Uma tela so: dado um item, quem cobra quanto HOJE. Le apenas a tabela
 * vigente de cada fornecedor (vigenciaFim null).
 */
export default async function ComparadorPage() {
  const usuario = await exigirUsuario();

  const fornecedores = await db.fornecedor.findMany({
    where: { empresaId: usuario.empresaId, ativo: true },
    include: { tabelasPreco: { where: { vigenciaFim: null }, include: { itens: true } } },
  });

  // Agrupa por item: cada item vira uma linha com todos os fornecedores.
  const porItem = new Map<
    string,
    { unidade: string; ofertas: { fornecedor: string; centavos: number }[] }
  >();

  for (const f of fornecedores) {
    for (const tabela of f.tabelasPreco) {
      for (const item of tabela.itens) {
        const atual = porItem.get(item.descricao) ?? { unidade: item.unidade, ofertas: [] };
        atual.ofertas.push({ fornecedor: f.nome, centavos: item.precoCentavos });
        porItem.set(item.descricao, atual);
      }
    }
  }

  const linhas = [...porItem.entries()]
    .map(([descricao, dados]) => ({
      descricao,
      unidade: dados.unidade,
      ofertas: dados.ofertas.sort((a, b) => a.centavos - b.centavos),
    }))
    .sort((a, b) => b.ofertas.length - a.ofertas.length);

  const comparaveis = linhas.filter((l) => l.ofertas.length > 1);
  const unicos = linhas.filter((l) => l.ofertas.length === 1);

  return (
    <>
      <TituloPagina
        titulo="Comparar preços"
        sub="Quem cobra quanto hoje, por item"
        acao={<Botao href="/fornecedores" variante="vazio">Fornecedores</Botao>}
      />

      {linhas.length === 0 ? (
        <Vazio
          titulo="Nenhum preço cadastrado ainda."
          texto="Cadastre o preço de pelo menos dois fornecedores para o mesmo item e a comparação aparece aqui."
          acao={<Botao href="/fornecedores">Ir para fornecedores</Botao>}
        />
      ) : (
        <>
          {comparaveis.length > 0 && (
            <ul className="mt-6 flex flex-col gap-4">
              {comparaveis.map((l) => {
                const maisBarato = l.ofertas[0];
                const maisCaro = l.ofertas[l.ofertas.length - 1];
                const diferenca = Math.round(
                  ((maisCaro.centavos - maisBarato.centavos) / maisBarato.centavos) * 100,
                );
                return (
                  <li key={l.descricao} className="rounded border border-fio p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h2 className="font-semibold">{l.descricao}</h2>
                      <span className="text-sm fraco">por {unidadeCurta[l.unidade] ?? l.unidade}</span>
                    </div>

                    <ul className="mt-4 flex flex-col gap-2">
                      {l.ofertas.map((o, i) => (
                        <li
                          key={o.fornecedor}
                          className={`flex flex-wrap items-center justify-between gap-3 rounded-sm border px-4 py-3 ${
                            i === 0 ? 'border-ok bg-ok/5' : 'border-fio'
                          }`}
                        >
                          <span className="font-medium">{o.fornecedor}</span>
                          <span className="flex items-center gap-3">
                            <span className="font-semibold">{centavosParaReais(o.centavos)}</span>
                            {i === 0 && <span className="selo selo-bom">Mais barato</span>}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {diferenca > 0 && (
                      <p className="mt-3 text-sm fraco">
                        Comprando do mais barato você paga {diferenca}% a menos do que no mais caro.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {unicos.length > 0 && (
            <section className="mt-9">
              <h2 className="text-rotulo font-bold uppercase fraco">Só um fornecedor tem preço</h2>
              <p className="mt-2 max-w-[60ch] text-sm fraco">
                Sem um segundo preço não dá para comparar. Vale pedir cotação para outro
                fornecedor destes itens.
              </p>
              <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
                {unicos.map((l) => (
                  <li key={l.descricao} className="flex flex-wrap justify-between gap-3 px-4 py-3 text-sm">
                    <span>{l.descricao}</span>
                    <span className="fraco">
                      {l.ofertas[0].fornecedor} — {centavosParaReais(l.ofertas[0].centavos)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
