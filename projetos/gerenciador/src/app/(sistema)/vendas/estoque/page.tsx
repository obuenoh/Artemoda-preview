import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoProdutos } from '@/lib/produtos';
import { centavosParaReais } from '@/lib/numeros';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Estoque da loja' };

export default async function EstoqueLojaPage() {
  const usuario = await exigirUsuario();
  const produtos = await posicaoProdutos(usuario.empresaId);

  const abaixo = produtos.filter((p) => p.abaixoDoMinimo);

  return (
    <>
      <TituloPagina
        titulo="Estoque da loja"
        sub="Peças prontas para vender no balcão — cada uma com seu código"
        acao={
          <div className="flex flex-wrap gap-3">
            <Botao href="/vendas" variante="vazio">
              Voltar para Vendas
            </Botao>
            <Botao href="/vendas/estoque/novo">Nova peça</Botao>
          </div>
        }
      />

      {produtos.length === 0 ? (
        <Vazio
          titulo="Nenhuma peça cadastrada."
          texto="Cadastre as peças que ficam prontas na loja, cada uma com um código (SKU ou código de barras). Depois é só bipar na hora de vender."
          acao={<Botao href="/vendas/estoque/novo">Cadastrar peça</Botao>}
        />
      ) : (
        <>
          {abaixo.length > 0 && (
            <p className="mt-5 rounded border border-alerta bg-alerta/5 px-4 py-3 text-sm">
              <strong>{abaixo.length} peça(s) abaixo do mínimo:</strong>{' '}
              {abaixo.map((p) => p.nome).join(', ')}.
            </p>
          )}

          <div className="tabela-rolagem mt-6">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="th">Peça</th>
                  <th className="th">Código</th>
                  <th className="th">Preço</th>
                  <th className="th">Tem na loja</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td className="td font-semibold">
                      {p.nome}
                      {(p.tamanho || p.cor) && (
                        <span className="miudo">{[p.tamanho, p.cor].filter(Boolean).join(' · ')}</span>
                      )}
                    </td>
                    <td className="td font-mono text-xs">{p.sku}</td>
                    <td className="td">{centavosParaReais(p.precoVendaCentavos)}</td>
                    <td className="td font-semibold">
                      {p.saldo}
                      {p.abaixoDoMinimo && <span className="miudo text-alerta">mínimo {p.estoqueMinimo}</span>}
                    </td>
                    <td className="td">
                      <Link
                        href={`/vendas/estoque/${p.id}/entrada`}
                        className="compacto text-rotulo font-bold uppercase text-gold"
                      >
                        + Entrada →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
