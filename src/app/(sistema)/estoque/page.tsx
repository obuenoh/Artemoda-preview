import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoEstoque } from '@/lib/estoque';
import { centavosParaReais, centavosNumero, milFormatado } from '@/lib/numeros';
import { TituloPagina, FaixaTotal, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Estoque' };

export default async function EstoquePage() {
  const usuario = await exigirUsuario();
  const linhas = await posicaoEstoque(usuario.empresaId);

  const total = linhas.reduce((s, l) => s + l.valorCentavos, 0);
  const abaixo = linhas.filter((l) => l.abaixoDoMinimo);

  return (
    <>
      <TituloPagina
        titulo="Estoque de tecido"
        sub="Saldo, custo e tempo parado — tudo somado a partir dos lançamentos"
        acao={
          <div className="flex flex-wrap gap-3">
            <Botao href="/estoque/parado" variante="vazio">
              O que está parado
            </Botao>
            <Botao href="/estoque/contagem">Fazer contagem</Botao>
          </div>
        }
      />

      {linhas.length === 0 ? (
        <Vazio
          titulo="Nenhum tecido cadastrado."
          texto="Cadastre os tecidos e registre a primeira compra — ou faça o estoque de abertura para começar com o que já está na prateleira."
          acao={<Botao href="/tecidos/novo">Cadastrar tecido</Botao>}
        />
      ) : (
        <>
          {abaixo.length > 0 && (
            <p className="mt-5 rounded border border-alerta bg-alerta/5 px-4 py-3 text-sm">
              <strong>{abaixo.length} tecido(s) abaixo do mínimo:</strong>{' '}
              {abaixo.map((l) => l.nome).join(', ')}.
            </p>
          )}

          <div className="tabela-rolagem mt-6">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="th">Tecido</th>
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
            <span className="text-sm text-[color:var(--texto-claro)]">Total em tecido:</span>
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
