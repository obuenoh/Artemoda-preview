import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { somarDias, inicioDoDia, fimDoDia } from '@/lib/numeros';
import { Dinheiro } from '@/components/Valores';
import { CATEGORIAS_SAIDA, type CategoriaSaida } from '@/lib/financeiro';
import { TituloPagina, Vazio, Botao, FaixaTotal } from '@/components/Ui';
import { LinhaConta } from '../LinhaConta';
import { agruparPorUrgencia, linhaAberta, linhaFechada, parcelaTexto, tituloFaixa } from '../apresentar';

export const metadata = { title: 'Contas a pagar' };

export default async function ContasPagarPage() {
  const usuario = await exigirPapel('dona');
  const hoje = inicioDoDia(new Date());

  const [abertas, pagas] = await Promise.all([
    db.contaPagar.findMany({
      where: { empresaId: usuario.empresaId, situacao: 'aberta' },
      include: { fornecedor: { select: { nome: true } } },
      orderBy: { vencimento: 'asc' },
    }),
    db.contaPagar.findMany({
      where: { empresaId: usuario.empresaId, situacao: 'paga', pagoEm: { gte: somarDias(hoje, -30) } },
      include: { fornecedor: { select: { nome: true } } },
      orderBy: { pagoEm: 'desc' },
      take: 40,
    }),
  ]);

  const grupos = agruparPorUrgencia(abertas);
  // Os totais somam so o que aparece: conta fixa pesa um mes, nao os doze.
  const visiveis = grupos.flatMap((g) => g.contas);
  const soma = (lista: typeof abertas) => lista.reduce((s, c) => s + c.valorCentavos, 0);
  const vencidas = visiveis.filter((c) => c.vencimento < hoje);
  const em7 = visiveis.filter((c) => c.vencimento >= hoje && c.vencimento <= fimDoDia(somarDias(hoje, 7)));
  const ocultasFixas = abertas.length - visiveis.length;

  const detalhes = (c: (typeof abertas)[number]) => [
    c.fornecedor?.nome ?? '',
    CATEGORIAS_SAIDA[c.categoria as CategoriaSaida] ?? '',
    parcelaTexto(c),
  ];

  return (
    <>
      <TituloPagina
        titulo="Contas a pagar"
        sub="Em ordem de urgência: o que venceu vem primeiro"
        acao={<Botao href="/financeiro/pagar/nova">Nova conta</Botao>}
      />

      {abertas.length === 0 ? (
        <Vazio
          titulo="Nenhuma conta em aberto."
          texto="Cadastre aluguel, luz, serviço de bordado ou o boleto do fornecedor. Compra de tecido a prazo entra aqui sozinha."
          acao={<Botao href="/financeiro/pagar/nova">Cadastrar conta</Botao>}
        />
      ) : (
        <>
          <FaixaTotal>
            <span className="text-sm text-[color:var(--texto-claro)]">Em aberto</span>
            <span className="text-2xl font-bold">{<Dinheiro centavos={soma(visiveis)} />}</span>
            {vencidas.length > 0 && (
              <span className="text-sm">
                <span className="font-bold text-cream">{<Dinheiro centavos={soma(vencidas)} />} vencido</span>
              </span>
            )}
            <span className="text-sm text-[color:var(--texto-claro)]">
              {<Dinheiro centavos={soma(em7)} />} nos próximos 7 dias
            </span>
          </FaixaTotal>

          {grupos.map((g) => (
            <section key={g.faixa} className="mt-8">
              <h2 className={`text-rotulo font-bold uppercase ${g.faixa === 'vencida' ? 'text-alerta' : 'fraco'}`}>
                {tituloFaixa[g.faixa]} · {<Dinheiro centavos={soma(g.contas)} />}
              </h2>
              <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
                {g.contas.map((c) => (
                  <LinhaConta key={c.id} tipo="pagar" conta={linhaAberta(c, detalhes(c))} />
                ))}
              </ul>
            </section>
          ))}

          {ocultasFixas > 0 && (
            <p className="mt-4 text-sm fraco">
              Contas fixas mostram só o próximo mês. Os outros {ocultasFixas} vencimentos aparecem conforme
              forem chegando.
            </p>
          )}
        </>
      )}

      {pagas.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-rotulo font-bold uppercase fraco">
            Pagas nos últimos 30 dias · {pagas.length}
          </summary>
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
            {pagas.map((c) => (
              <LinhaConta
                key={c.id}
                tipo="pagar"
                conta={linhaFechada(
                  { ...c, quitadaEm: c.pagoEm, valorQuitadoCentavos: c.valorPagoCentavos },
                  'pago',
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
