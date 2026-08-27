import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { centavosParaReais, dataBR } from '@/lib/numeros';
import { TituloPagina } from '@/components/Ui';
import { FormPreco } from './FormPreco';

export const metadata = { title: 'Fornecedor' };

const rotuloPagamento: Record<string, string> = {
  a_vista: 'À vista',
  '30': '30 dias',
  '30_60': '30/60 dias',
};

const unidadeCurta: Record<string, string> = { metro: 'metro', kg: 'kg', peca: 'peça' };

export default async function FornecedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const fornecedor = await db.fornecedor.findFirst({
    where: { id, empresaId: usuario.empresaId },
    include: {
      tabelasPreco: { orderBy: { vigenciaInicio: 'desc' }, include: { itens: true } },
      compras: { orderBy: { data: 'desc' }, take: 5, include: { itens: true } },
    },
  });
  if (!fornecedor) notFound();

  const tecidos = await db.materiaPrima.findMany({
    where: { empresaId: usuario.empresaId, ativo: true },
    orderBy: { nome: 'asc' },
  });

  const vigente = fornecedor.tabelasPreco.find((t) => t.vigenciaFim === null);
  const anteriores = fornecedor.tabelasPreco.filter((t) => t.vigenciaFim !== null);

  /** Variação do preço de cada item em relação à vigência anterior. */
  const anterior = anteriores[0];
  function variacao(descricao: string, precoAtual: number): number | null {
    const antigo = anterior?.itens.find((i) => i.descricao === descricao);
    if (!antigo || antigo.precoCentavos === 0) return null;
    const pct = Math.round(((precoAtual - antigo.precoCentavos) / antigo.precoCentavos) * 100);
    return pct === 0 ? null : pct;
  }

  return (
    <>
      <Link href="/fornecedores" className="compacto text-rotulo font-bold uppercase text-gold">
        ← Fornecedores
      </Link>

      <div className="mt-3">
        <TituloPagina
          titulo={fornecedor.nome}
          sub={[
            rotuloPagamento[fornecedor.condicaoPagamento],
            fornecedor.prazoMedioDias > 0 ? `entrega em ~${fornecedor.prazoMedioDias} dias` : null,
            fornecedor.whatsapp,
            fornecedor.contato,
          ]
            .filter(Boolean)
            .join(' · ')}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-rotulo font-bold uppercase text-gold">Preços de hoje</h2>

        {!vigente || vigente.itens.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">
            Nenhum preço registrado ainda. Cadastre abaixo — é o que permite comparar fornecedores
            e ver quando alguém subiu o preço.
          </p>
        ) : (
          <div className="tabela-rolagem mt-3">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="th">Item</th>
                  <th className="th">Unidade</th>
                  <th className="th">Preço</th>
                  <th className="th">Comparado ao anterior</th>
                </tr>
              </thead>
              <tbody>
                {vigente.itens.map((i) => {
                  const v = variacao(i.descricao, i.precoCentavos);
                  return (
                    <tr key={i.id}>
                      <td className="td font-semibold">{i.descricao}</td>
                      <td className="td">por {unidadeCurta[i.unidade] ?? i.unidade}</td>
                      <td className="td font-semibold">{centavosParaReais(i.precoCentavos)}</td>
                      <td className="td">
                        {v === null ? (
                          <span className="fraco">—</span>
                        ) : v > 0 ? (
                          <span className="font-semibold text-alerta">subiu {v}%</span>
                        ) : (
                          <span className="font-semibold text-ok">caiu {Math.abs(v)}%</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-2 text-xs fraco">
          Preço em vigor desde {vigente ? dataBR(vigente.vigenciaInicio) : '—'}.
        </p>
      </section>

      <section className="mt-9 rounded border border-fio bg-cream-alt p-5">
        <h2 className="font-display text-xl">Registrar um preço novo</h2>
        <p className="mt-1 text-sm fraco">
          O preço antigo não é apagado — ele vira histórico, e é assim que o sistema mostra quem
          aumentou.
        </p>
        <FormPreco
          fornecedorId={fornecedor.id}
          tecidos={tecidos.map((t) => ({
            id: t.id,
            nome: `${t.nome}${t.cor ? ` · ${t.cor}` : ''}`,
            unidade: t.unidade,
          }))}
        />
      </section>

      {anteriores.length > 0 && (
        <section className="mt-9">
          <h2 className="text-rotulo font-bold uppercase fraco">Histórico de preços</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {anteriores.map((t) => (
              <li key={t.id} className="rounded border border-fio p-4">
                <p className="text-rotulo font-semibold uppercase fraco">
                  De {dataBR(t.vigenciaInicio)} até {t.vigenciaFim ? dataBR(t.vigenciaFim) : '—'}
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {t.itens.map((i) => (
                    <li key={i.id} className="flex justify-between gap-4 text-sm">
                      <span>{i.descricao}</span>
                      <span className="font-semibold">{centavosParaReais(i.precoCentavos)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
