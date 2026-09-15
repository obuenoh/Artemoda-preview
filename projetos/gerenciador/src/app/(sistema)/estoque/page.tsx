import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoEstoque, listarTiposProduto } from '@/lib/estoque';
import { centavosParaReais, centavosNumero, milFormatado } from '@/lib/numeros';
import { TituloPagina, FaixaTotal, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Estoque' };

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ setor?: string }>;
}) {
  const { setor } = await searchParams;
  const usuario = await exigirUsuario();

  const [todasLinhas, tipos] = await Promise.all([
    posicaoEstoque(usuario.empresaId),
    listarTiposProduto(usuario.empresaId),
  ]);

  const linhas = setor ? todasLinhas.filter((l) => l.tipoProdutoId === setor) : todasLinhas;
  const abaixo = linhas.filter((l) => l.abaixoDoMinimo);
  const total = linhas.reduce((s, l) => s + l.valorCentavos, 0);

  // Contagem por setor, para o filtro mostrar quanto tem em cada um.
  const contagemPorTipo = new Map<string, number>();
  for (const l of todasLinhas) {
    contagemPorTipo.set(l.tipoProdutoId, (contagemPorTipo.get(l.tipoProdutoId) ?? 0) + 1);
  }

  return (
    <>
      <TituloPagina
        titulo="Estoque"
        sub="Tecido e aviamento — saldo, custo e tempo parado, por setor"
        acao={
          <div className="flex flex-wrap gap-3">
            <Botao href="/estoque/parado" variante="vazio">
              O que está parado
            </Botao>
            <Botao href="/estoque/contagem" variante="vazio">
              Fazer contagem
            </Botao>
            <Botao href="/estoque/novo-produto">Novo produto</Botao>
          </div>
        }
      />

      {tipos.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/estoque"
            className={`bt compacto py-2 ${!setor ? 'bt-cheio' : 'bt-vazio'}`}
          >
            Todos os setores
          </Link>
          {tipos.map((t) => (
            <Link
              key={t.id}
              href={`/estoque?setor=${t.id}`}
              className={`bt compacto py-2 ${setor === t.id ? 'bt-cheio' : 'bt-vazio'}`}
            >
              {t.nome}
              {contagemPorTipo.has(t.id) && (
                <span className="ml-1.5 opacity-70">({contagemPorTipo.get(t.id)})</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {todasLinhas.length === 0 ? (
        <Vazio
          titulo="Nenhum produto cadastrado."
          texto="Cadastre tecido, etiqueta, elástico, agulha, zíper — o que você compra e guarda em estoque. Depois disso dá para registrar compras e acompanhar o que tem."
          acao={<Botao href="/estoque/novo-produto">Cadastrar produto</Botao>}
        />
      ) : linhas.length === 0 ? (
        <Vazio titulo="Nada neste setor ainda." texto="Cadastre o primeiro produto deste tipo." acao={<Botao href="/estoque/novo-produto">Novo produto</Botao>} />
      ) : (
        <>
          {abaixo.length > 0 && (
            <p className="mt-5 rounded border border-alerta bg-alerta/5 px-4 py-3 text-sm">
              <strong>{abaixo.length} item(ns) abaixo do mínimo:</strong>{' '}
              {abaixo.map((l) => l.nome).join(', ')}.
            </p>
          )}

          <div className="tabela-rolagem mt-6">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="th">Produto</th>
                  <th className="th">Setor</th>
                  <th className="th">Onde está</th>
                  <th className="th">Tem</th>
                  <th className="th">Custo médio</th>
                  <th className="th">Última compra</th>
                  <th className="th">Parado há</th>
                  <th className="th">Vale</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id}>
                    <td className="td font-semibold">
                      {l.nome}
                      {l.cor && <span className="miudo">{l.cor}</span>}
                    </td>
                    <td className="td">
                      <span className="selo selo-neutro">{l.tipoProdutoNome}</span>
                    </td>
                    <td className="td">{l.localizacao ?? <span className="fraco">—</span>}</td>
                    <td className="td font-semibold">
                      {milFormatado(l.saldoMil, l.unidade)}
                      {l.abaixoDoMinimo && (
                        <span className="miudo text-alerta">
                          mínimo {milFormatado(l.estoqueMinimoMil, l.unidade)}
                        </span>
                      )}
                    </td>
                    <td className="td">
                      {l.custoMedioCentavos > 0 ? (
                        centavosNumero(l.custoMedioCentavos)
                      ) : (
                        <span className="fraco">—</span>
                      )}
                    </td>
                    <td className="td">
                      {l.ultimoCustoCentavos > 0 ? (
                        <>
                          {centavosNumero(l.ultimoCustoCentavos)}
                          {l.variacaoPct !== null && l.variacaoPct !== 0 && (
                            <span
                              className={`ml-1.5 font-semibold ${
                                l.variacaoPct > 0 ? 'text-alerta' : 'text-ok'
                              }`}
                            >
                              {l.variacaoPct > 0 ? '▲' : '▼'} {Math.abs(l.variacaoPct)}%
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="fraco">—</span>
                      )}
                    </td>
                    <td className="td">
                      {l.diasParado === null ? (
                        <span className="fraco">sem movimento</span>
                      ) : l.diasParado > 180 ? (
                        <span className="selo selo-ruim">{l.diasParado} dias</span>
                      ) : (
                        `${l.diasParado} dias`
                      )}
                    </td>
                    <td className="td font-semibold">{centavosParaReais(l.valorCentavos)}</td>
                    <td className="td">
                      <Link
                        href={`/estoque/${l.id}`}
                        className="compacto text-rotulo font-bold uppercase text-gold"
                      >
                        Extrato →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FaixaTotal>
            <span className="text-sm text-[color:var(--texto-claro)]">
              {setor ? 'Total neste setor:' : 'Total em estoque:'}
            </span>
            <span className="text-xl font-bold">{centavosParaReais(total)}</span>
          </FaixaTotal>

          <p className="mt-4 max-w-[70ch] text-xs fraco">
            O custo médio muda a cada compra e já inclui a parte do frete daquele item. Quando a
            última compra sai mais cara que o médio, a seta vermelha mostra em quanto.
          </p>
        </>
      )}
    </>
  );
}
