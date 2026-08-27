import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { situacaoRemessas, rotuloServico } from '@/lib/parceiros';
import { centavosParaReais, centavosNumero, dataCurtaBR } from '@/lib/numeros';
import { TituloPagina, FaixaTotal, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Parceiros' };

export default async function ParceirosPage() {
  const usuario = await exigirUsuario();
  const remessas = await situacaoRemessas(usuario.empresaId);

  // Ordem por urgencia, nao por data: o que estourou o prazo lidera, e
  // depois o que vence primeiro. A linha que exige acao tem que ser a
  // primeira que ela ve.
  const abertas = remessas
    .filter((r) => !r.fechada)
    .sort(
      (a, b) =>
        b.atrasadaDias - a.atrasadaDias ||
        a.previsaoRetorno.getTime() - b.previsaoRetorno.getTime(),
    );
  const fechadas = remessas.filter((r) => r.fechada);
  const pecasFora = abertas.reduce((s, r) => s + r.aindaFora, 0);
  const valorFora = abertas.reduce((s, r) => s + r.aindaFora * r.valorPorPecaCentavos, 0);

  return (
    <>
      <TituloPagina
        titulo="Peças no parceiro"
        sub="O que saiu para bordar, estampar ou silcar e ainda não voltou"
        acao={<Botao href="/parceiros/nova">Mandar peças</Botao>}
      />

      {remessas.length === 0 ? (
        <Vazio
          titulo="Nenhuma remessa registrada ainda."
          texto="Toda vez que peças saírem para um parceiro, registre aqui. É assim que você para de depender do WhatsApp para saber onde elas estão."
          acao={<Botao href="/parceiros/nova">Mandar peças</Botao>}
        />
      ) : (
        <>
          <h2 className="mt-8 text-rotulo font-bold uppercase text-gold">Fora agora</h2>

          {abertas.length === 0 ? (
            <p className="mt-3 rounded border border-dashed border-fio-ouro px-4 py-5 text-sm fraco">
              Nenhuma peça fora da empresa neste momento.
            </p>
          ) : (
            <div className="tabela-rolagem mt-3">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="th">Parceiro</th>
                    <th className="th">Lote</th>
                    <th className="th">Serviço</th>
                    <th className="th">Saiu</th>
                    <th className="th">Volta até</th>
                    <th className="th">Peças</th>
                    <th className="th">Situação</th>
                    <th className="th"></th>
                  </tr>
                </thead>
                <tbody>
                  {abertas.map((r) => (
                    <tr key={r.id}>
                      <td className="td font-semibold">
                        {r.fornecedorNome}
                        <span className="miudo">
                          {centavosNumero(r.valorPorPecaCentavos)} por peça
                        </span>
                      </td>
                      <td className="td">
                        {r.referencia}
                        {r.clienteNome && <span className="miudo">{r.clienteNome}</span>}
                      </td>
                      <td className="td">{rotuloServico[r.tipoServico] ?? r.tipoServico}</td>
                      <td className="td whitespace-nowrap">{dataCurtaBR(r.dataEnvio)}</td>
                      <td className="td whitespace-nowrap">{dataCurtaBR(r.previsaoRetorno)}</td>
                      <td className="td font-semibold">
                        {r.aindaFora}
                        {r.retornadasOk + r.retornadasDefeito > 0 && (
                          <span className="miudo">de {r.enviadas} — resto já voltou</span>
                        )}
                      </td>
                      <td className="td">
                        {r.atrasadaDias > 0 ? (
                          <span className="selo selo-ruim">
                            {r.atrasadaDias} dia{r.atrasadaDias > 1 ? 's' : ''} atrasada
                          </span>
                        ) : (
                          <span className="selo selo-neutro">No prazo</span>
                        )}
                      </td>
                      <td className="td">
                        <Link
                          href={`/parceiros/${r.id}`}
                          className="compacto text-rotulo font-bold uppercase text-gold"
                        >
                          Registrar volta →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <FaixaTotal>
            <span className="text-sm text-[color:var(--texto-claro)]">Fora da empresa agora:</span>
            <span className="text-xl font-bold">{pecasFora} peças</span>
            <span className="text-sm text-[color:var(--texto-claro)]">
              — {centavosParaReais(valorFora)} em serviço já combinado
            </span>
          </FaixaTotal>

          {fechadas.length > 0 && (
            <>
              <h2 className="mt-10 text-rotulo font-bold uppercase fraco">Já voltaram</h2>
              <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
                {fechadas.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                    <Link href={`/parceiros/${r.id}`} className="compacto font-semibold">
                      {r.fornecedorNome}
                    </Link>
                    <span className="text-sm fraco">{r.referencia}</span>
                    <span className="ml-auto text-sm">
                      {r.retornadasOk} boas
                      {r.retornadasDefeito > 0 && (
                        <span className="text-alerta"> · {r.retornadasDefeito} com defeito</span>
                      )}
                    </span>
                    <span className="selo selo-bom">Fechada</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </>
  );
}
