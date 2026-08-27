import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { estadoAtual, rotuloMovimento, type TipoMovimento } from '@/lib/estoque';
import { centavosParaReais, centavosNumero, milParaNumero, dataBR } from '@/lib/numeros';
import { TituloPagina } from '@/components/Ui';

export const metadata = { title: 'Extrato do tecido' };

/**
 * O extrato e a prova. Todo lancamento aparece com motivo e autor, e o
 * saldo de cada linha e o que ficou DEPOIS dela — da para conferir a conta
 * com o dedo na tela.
 */
export default async function ExtratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const tecido = await db.materiaPrima.findFirst({
    where: { id, empresaId: usuario.empresaId },
  });
  if (!tecido) notFound();

  const [estado, movimentos] = await Promise.all([
    estadoAtual(tecido.id),
    db.movimentoEstoque.findMany({
      where: { materiaPrimaId: tecido.id },
      orderBy: { criadoEm: 'desc' },
      take: 200,
    }),
  ]);

  const usuarios = await db.usuario.findMany({
    where: { empresaId: usuario.empresaId },
    select: { id: true, nome: true },
  });
  const nomePor = new Map(usuarios.map((u) => [u.id, u.nome]));

  const un = tecido.unidade === 'kg' ? 'kg' : 'm';

  return (
    <>
      <Link href="/estoque" className="compacto text-rotulo font-bold uppercase text-gold">
        ← Estoque
      </Link>

      <div className="mt-3">
        <TituloPagina
          titulo={`${tecido.nome}${tecido.cor ? ` · ${tecido.cor}` : ''}`}
          sub={[tecido.composicao, tecido.localizacao].filter(Boolean).join(' · ') || undefined}
        />
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-fio bg-cream-alt p-4">
          <dt className="text-rotulo font-semibold uppercase fraco">Tem hoje</dt>
          <dd className="mt-1 text-xl font-bold">
            {milParaNumero(estado.saldoMil)} {un}
          </dd>
        </div>
        <div className="rounded border border-fio bg-cream-alt p-4">
          <dt className="text-rotulo font-semibold uppercase fraco">Custo médio</dt>
          <dd className="mt-1 text-xl font-bold">
            {centavosParaReais(estado.custoMedioCentavos)}
            <span className="text-sm font-normal fraco"> / {un}</span>
          </dd>
        </div>
        <div className="rounded border border-fio bg-cream-alt p-4">
          <dt className="text-rotulo font-semibold uppercase fraco">Última compra</dt>
          <dd className="mt-1 text-xl font-bold">
            {estado.ultimoCustoCentavos > 0 ? (
              <>
                {centavosParaReais(estado.ultimoCustoCentavos)}
                <span className="text-sm font-normal fraco"> / {un}</span>
              </>
            ) : (
              <span className="fraco">—</span>
            )}
          </dd>
        </div>
      </dl>

      <h2 className="mt-9 text-rotulo font-bold uppercase text-gold">
        Tudo que entrou e saiu
      </h2>

      {movimentos.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">
          Nenhum movimento ainda. Registre uma compra ou faça o estoque de abertura.
        </p>
      ) : (
        <div className="tabela-rolagem mt-3">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="th">Quando</th>
                <th className="th">O que foi</th>
                <th className="th">Quantidade</th>
                <th className="th">Custo da unidade</th>
                <th className="th">Ficou com</th>
                <th className="th">Custo médio depois</th>
                <th className="th">Motivo</th>
                <th className="th">Quem</th>
              </tr>
            </thead>
            <tbody>
              {movimentos.map((m) => {
                const entrada = m.quantidadeMil > 0;
                return (
                  <tr key={m.id}>
                    <td className="td whitespace-nowrap">{dataBR(m.criadoEm)}</td>
                    <td className="td">
                      {rotuloMovimento[m.tipo as TipoMovimento] ?? m.tipo}
                    </td>
                    <td className={`td font-semibold ${entrada ? 'text-ok' : 'text-alerta'}`}>
                      {entrada ? '+' : '−'} {milParaNumero(Math.abs(m.quantidadeMil))} {un}
                    </td>
                    <td className="td">{centavosNumero(m.custoUnitarioCentavos)}</td>
                    <td className="td">
                      {milParaNumero(m.saldoAposMil)} {un}
                    </td>
                    <td className="td">{centavosNumero(m.custoMedioAposCentavos)}</td>
                    <td className="td">{m.motivo ?? <span className="fraco">—</span>}</td>
                    <td className="td">
                      {m.usuarioId ? (
                        (nomePor.get(m.usuarioId) ?? '—')
                      ) : (
                        <span className="fraco">sistema</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 max-w-[70ch] text-xs fraco">
        Nenhuma linha deste extrato é apagada ou alterada. Se algum número estiver errado, a
        correção entra como um novo lançamento de ajuste, com o motivo e o nome de quem fez.
      </p>
    </>
  );
}
