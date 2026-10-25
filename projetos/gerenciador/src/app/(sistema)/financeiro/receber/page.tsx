import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { somarDias, inicioDoDia, fimDoDia } from '@/lib/numeros';
import { Dinheiro } from '@/components/Valores';
import { TituloPagina, Vazio, Botao, FaixaTotal } from '@/components/Ui';
import { LinhaConta } from '../LinhaConta';
import { agruparPorUrgencia, linhaAberta, linhaFechada, parcelaTexto, tituloFaixa } from '../apresentar';

export const metadata = { title: 'Contas a receber' };

export default async function ContasReceberPage() {
  const usuario = await exigirPapel('dona');
  const hoje = inicioDoDia(new Date());

  const [abertas, recebidas] = await Promise.all([
    db.contaReceber.findMany({
      where: { empresaId: usuario.empresaId, situacao: 'aberta' },
      include: { cliente: { select: { nome: true } } },
      orderBy: { vencimento: 'asc' },
    }),
    db.contaReceber.findMany({
      where: { empresaId: usuario.empresaId, situacao: 'recebida', recebidoEm: { gte: somarDias(hoje, -30) } },
      include: { cliente: { select: { nome: true } } },
      orderBy: { recebidoEm: 'desc' },
      take: 40,
    }),
  ]);

  const grupos = agruparPorUrgencia(abertas);
  const soma = (lista: typeof abertas) => lista.reduce((s, c) => s + c.valorCentavos, 0);
  const atrasadas = abertas.filter((c) => c.vencimento < hoje);
  const em7 = abertas.filter((c) => c.vencimento >= hoje && c.vencimento <= fimDoDia(somarDias(hoje, 7)));

  const detalhes = (c: (typeof abertas)[number]) => [
    c.cliente?.nome ?? '',
    c.vendaId ? 'venda fiado' : '',
    parcelaTexto(c),
  ];

  return (
    <>
      <TituloPagina
        titulo="Contas a receber"
        sub="Venda fiado entra aqui sozinha. Sinal e restante de pedido, cadastre"
        acao={<Botao href="/financeiro/receber/nova">Nova conta a receber</Botao>}
      />

      {abertas.length === 0 ? (
        <Vazio
          titulo="Ninguém deve nada agora."
          texto="Quando vender fiado, a conta aparece aqui com o prazo do cliente. Para pedido com sinal e restante na entrega, cadastre o restante."
          acao={<Botao href="/financeiro/receber/nova">Cadastrar conta a receber</Botao>}
        />
      ) : (
        <>
          <FaixaTotal>
            <span className="text-sm text-[color:var(--texto-claro)]">Para receber</span>
            <span className="text-2xl font-bold">{<Dinheiro centavos={soma(abertas)} />}</span>
            {atrasadas.length > 0 && (
              <span className="text-sm font-bold text-cream">
                {<Dinheiro centavos={soma(atrasadas)} />} atrasado
              </span>
            )}
            <span className="text-sm text-[color:var(--texto-claro)]">
              {<Dinheiro centavos={soma(em7)} />} nos próximos 7 dias
            </span>
          </FaixaTotal>

          {grupos.map((g) => (
            <section key={g.faixa} className="mt-8">
              <h2 className={`text-rotulo font-bold uppercase ${g.faixa === 'vencida' ? 'text-alerta' : 'fraco'}`}>
                {g.faixa === 'vencida' ? 'Atrasadas' : tituloFaixa[g.faixa]} · {<Dinheiro centavos={soma(g.contas)} />}
              </h2>
              <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
                {g.contas.map((c) => (
                  <LinhaConta key={c.id} tipo="receber" conta={linhaAberta(c, detalhes(c))} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {recebidas.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-rotulo font-bold uppercase fraco">
            Recebidas nos últimos 30 dias · {recebidas.length}
          </summary>
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
            {recebidas.map((c) => (
              <LinhaConta
                key={c.id}
                tipo="receber"
                conta={linhaFechada(
                  { ...c, quitadaEm: c.recebidoEm, valorQuitadoCentavos: c.valorRecebidoCentavos },
                  'recebido',
                  detalhes(c),
                )}
              />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
