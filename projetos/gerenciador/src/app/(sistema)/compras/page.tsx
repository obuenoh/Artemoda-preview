import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { centavosParaReais, milFormatado, dataBR, valorDe } from '@/lib/numeros';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Compras' };

export default async function ComprasPage() {
  const usuario = await exigirUsuario();

  const compras = await db.compra.findMany({
    where: { empresaId: usuario.empresaId },
    include: { fornecedor: true, itens: { include: { materiaPrima: true } } },
    orderBy: { data: 'desc' },
    take: 50,
  });

  return (
    <>
      <TituloPagina
        titulo="Compras de tecido"
        sub="O que entrou, de quem e por quanto"
        acao={<Botao href="/compras/nova">Registrar compra</Botao>}
      />

      {compras.length === 0 ? (
        <Vazio
          titulo="Nenhuma compra registrada."
          texto="Toda vez que chegar tecido, registre aqui. É o que faz o estoque e o custo médio existirem."
          acao={<Botao href="/compras/nova">Registrar compra</Botao>}
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {compras.map((c) => {
            const mercadoria = c.itens.reduce(
              (s, i) => s + valorDe(i.quantidadeMil, i.valorUnitarioCentavos),
              0,
            );
            const total = mercadoria + c.freteCentavos + c.outrosCustosCentavos;

            return (
              <li key={c.id} className="rounded border border-fio p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.fornecedor.nome}</p>
                    <p className="miudo">
                      {dataBR(c.data)}
                      {c.numeroNf ? ` · nota ${c.numeroNf}` : ' · sem nota informada'}
                    </p>
                  </div>
                  <p className="text-lg font-bold">{centavosParaReais(total)}</p>
                </div>

                <ul className="mt-3 flex flex-col gap-1 border-t border-fio pt-3">
                  {c.itens.map((i) => (
                    <li key={i.id} className="flex flex-wrap justify-between gap-3 text-sm">
                      <span>
                        {i.materiaPrima.nome}
                        {i.materiaPrima.cor && <span className="fraco"> · {i.materiaPrima.cor}</span>}
                      </span>
                      <span className="fraco">
                        {milFormatado(i.quantidadeMil, i.materiaPrima.unidade)} ×{' '}
                        {centavosParaReais(i.valorUnitarioCentavos)}
                        {i.rateioCentavos > 0 && ` (+${centavosParaReais(i.rateioCentavos)} de frete)`}
                      </span>
                    </li>
                  ))}
                </ul>

                {(c.freteCentavos > 0 || c.outrosCustosCentavos > 0) && (
                  <p className="mt-2 text-xs fraco">
                    Frete e outros custos foram divididos entre os itens por valor — já estão
                    dentro do custo de cada tecido.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
