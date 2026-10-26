import { exigirUsuario } from '@/lib/sessao';
import { posicaoProdutos } from '@/lib/produtos';
import { LISTA_FRENTES, FRENTES } from '@/lib/frentes';
import { TituloPagina, Vazio, Botao, Aviso } from '@/components/Ui';
import { LinhaPeca } from './LinhaPeca';

export const metadata = { title: 'Peças' };

/**
 * Estoque de peca pronta nas tres frentes, lado a lado. Toda peca nasce na
 * Fabrica (+ Producao) e chega a Loja e ao E-commerce por envio. Cada venda
 * baixa do estoque da propria frente.
 */
export default async function PecasPage() {
  const usuario = await exigirUsuario();
  const produtos = await posicaoProdutos(usuario.empresaId);
  const abaixo = produtos.filter((p) => p.abaixoDoMinimo);
  const totais = Object.fromEntries(
    LISTA_FRENTES.map((f) => [f, produtos.reduce((s, p) => s + p.saldos[f], 0)]),
  ) as Record<(typeof LISTA_FRENTES)[number], number>;

  return (
    <>
      <TituloPagina
        titulo="Peças prontas"
        sub="Toda peça nasce na Fábrica e vai para a Loja ou o E-commerce por envio"
        acao={<Botao href="/pecas/nova">Nova peça</Botao>}
      />

      {produtos.length === 0 ? (
        <Vazio
          titulo="Nenhuma peça cadastrada."
          texto="Cadastre cada peça com o seu código (tamanho e cor têm códigos próprios). Depois registre a produção e envie para a Loja ou o E-commerce."
          acao={<Botao href="/pecas/nova">Cadastrar peça</Botao>}
        />
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            {LISTA_FRENTES.map((f) => (
              <span key={f} className="rounded border border-fio bg-cream-alt px-3 py-2">
                <span className="fraco">{FRENTES[f]}:</span> <strong>{totais[f]}</strong> peça(s)
              </span>
            ))}
          </div>

          {abaixo.length > 0 && (
            <Aviso tom="alerta">
              <strong>{abaixo.length} peça(s) abaixo do mínimo</strong> (somando as três frentes):{' '}
              {abaixo.map((p) => [p.nome, p.tamanho].filter(Boolean).join(' ')).join(', ')}.
            </Aviso>
          )}

          <div className="tabela-rolagem mt-5">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr>
                  <th className="th">Peça</th>
                  <th className="th">Preço</th>
                  {LISTA_FRENTES.map((f) => (
                    <th key={f} className="th text-center">
                      {FRENTES[f]}
                    </th>
                  ))}
                  <th className="th text-center">Total</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <LinhaPeca
                    key={p.id}
                    p={{
                      id: p.id,
                      nome: p.nome,
                      detalhe: [p.tamanho, p.cor].filter(Boolean).join(' · '),
                      sku: p.sku,
                      precoVendaCentavos: p.precoVendaCentavos,
                      saldos: p.saldos,
                      saldo: p.saldo,
                      abaixoDoMinimo: p.abaixoDoMinimo,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
