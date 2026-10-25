import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoEstoque } from '@/lib/estoque';
import { posicaoProdutos } from '@/lib/produtos';
import { resumoVendas, vendasPorDia } from '@/lib/vendas';
import { pendenciasFinanceiras, previsao, temAbertura } from '@/lib/financeiro';
import { dataCurtaBR, diasAte, fimDoDia, inicioDoDia, somarDias } from '@/lib/numeros';
import { Dinheiro, BotaoOcultar } from '@/components/Valores';
import { GraficoVendas } from '@/components/GraficoVendas';

export const metadata = { title: 'Visão Geral' };

type Pendencia = {
  chave: string;
  grave: boolean;
  titulo: string;
  detalhe?: string;
  centavos?: number;
  href: string;
  acao: string;
};

/** "Elástico, Ribana e Zíper" — e "e mais N" quando a lista e longa. */
function juntarNomes(nomes: string[], limite = 3): string {
  const mostrados = nomes.slice(0, limite);
  const resto = nomes.length - mostrados.length;
  const base = mostrados.length > 1 ? `${mostrados.slice(0, -1).join(', ')} e ${mostrados.at(-1)}` : mostrados[0];
  return resto > 0 ? `${mostrados.join(', ')} e mais ${resto}` : base;
}

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * A primeira tela responde duas perguntas: o que precisa de mim hoje, e
 * esta tudo bem? O detalhe mora na aba de cada assunto — aqui so o que
 * pede acao, tres numeros e o ritmo das vendas.
 */
export default async function VisaoGeralPage() {
  const usuario = await exigirUsuario();
  const dona = usuario.papel === 'dona';
  const veEstoque = usuario.papel !== 'vendas';
  const veLoja = usuario.papel !== 'producao';

  const agora = new Date();
  const hoje = inicioDoDia(agora);
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const [estoque, produtos, mes, hojeVendas, porDia, financeiro, prev, abriu, pagarAgora, receberAtrasado] =
    await Promise.all([
      veEstoque ? posicaoEstoque(usuario.empresaId) : [],
      veLoja ? posicaoProdutos(usuario.empresaId) : [],
      resumoVendas(usuario.empresaId, inicioMes, fimDoDia(agora)),
      resumoVendas(usuario.empresaId, hoje, fimDoDia(agora)),
      veLoja ? vendasPorDia(usuario.empresaId, somarDias(hoje, -29), fimDoDia(agora)) : [],
      // Dinheiro so a dona ve: para os outros papeis nem consulta.
      dona ? pendenciasFinanceiras(usuario.empresaId) : null,
      dona ? previsao(usuario.empresaId) : null,
      dona ? temAbertura(usuario.empresaId) : true,
      dona
        ? db.contaPagar.findMany({
            where: { empresaId: usuario.empresaId, situacao: 'aberta', vencimento: { lte: fimDoDia(agora) } },
            orderBy: { vencimento: 'asc' },
            select: { id: true, descricao: true, valorCentavos: true, vencimento: true },
          })
        : [],
      dona
        ? db.contaReceber.findMany({
            where: { empresaId: usuario.empresaId, situacao: 'aberta', vencimento: { lt: hoje } },
            orderBy: { vencimento: 'asc' },
            select: { id: true, descricao: true, valorCentavos: true, vencimento: true, cliente: { select: { nome: true } } },
          })
        : [],
    ]);

  // ── o que precisa dela, na ordem de urgencia ──────────────────────
  const pendencias: Pendencia[] = [];

  if (!abriu) {
    pendencias.push({
      chave: 'abertura',
      grave: false,
      titulo: 'Informe quanto a empresa tem hoje',
      detalhe: 'Sem isso o caixa mostra só o que passou pelo sistema.',
      href: '/financeiro/conferir',
      acao: 'Informar',
    });
  }

  const quandoVenceu = (vencimento: Date) => {
    const dias = -diasAte(vencimento);
    return dias <= 0 ? 'vence hoje' : dias === 1 ? 'venceu ontem' : `venceu há ${dias} dias`;
  };
  if (pagarAgora.length > 3) {
    pendencias.push({
      chave: 'pagar',
      grave: true,
      titulo: `${pagarAgora.length} contas vencidas ou vencendo hoje`,
      centavos: pagarAgora.reduce((s, c) => s + c.valorCentavos, 0),
      href: '/financeiro/pagar',
      acao: 'Pagar',
    });
  } else {
    for (const c of pagarAgora) {
      pendencias.push({
        chave: `pagar-${c.id}`,
        grave: c.vencimento < hoje,
        titulo: `${c.descricao} ${quandoVenceu(c.vencimento)}`,
        centavos: c.valorCentavos,
        href: '/financeiro/pagar',
        acao: 'Pagar',
      });
    }
  }

  if (receberAtrasado.length > 3) {
    pendencias.push({
      chave: 'receber',
      grave: true,
      titulo: `${receberAtrasado.length} clientes atrasados para pagar`,
      centavos: receberAtrasado.reduce((s, c) => s + c.valorCentavos, 0),
      href: '/financeiro/receber',
      acao: 'Cobrar',
    });
  } else {
    for (const c of receberAtrasado) {
      const dias = -diasAte(c.vencimento);
      pendencias.push({
        chave: `receber-${c.id}`,
        grave: true,
        titulo: `${c.cliente?.nome ?? c.descricao} atrasou ${dias === 1 ? '1 dia' : `${dias} dias`}`,
        detalhe: c.cliente ? c.descricao : undefined,
        centavos: c.valorCentavos,
        href: '/financeiro/receber',
        acao: 'Cobrar',
      });
    }
  }

  if (prev?.primeiroNegativo) {
    pendencias.push({
      chave: 'negativo',
      grave: true,
      titulo: `O caixa fica negativo em ${dataCurtaBR(prev.primeiroNegativo.dia)} se nada mudar`,
      centavos: prev.primeiroNegativo.saldoCentavos,
      href: '/financeiro',
      acao: 'Ver caixa',
    });
  }

  const tecidoAbaixo = estoque.filter((l) => l.abaixoDoMinimo);
  if (tecidoAbaixo.length > 0) {
    pendencias.push({
      chave: 'estoque',
      grave: false,
      titulo: `${juntarNomes(tecidoAbaixo.map((l) => l.nome))} abaixo do mínimo`,
      detalhe: 'Tecido e aviamento',
      href: '/estoque',
      acao: 'Ver o que comprar',
    });
  }

  // A dor que a dona contou: dinheiro dormindo na prateleira sem ninguem ver.
  const paradoLongo = estoque.filter((l) => l.saldoMil > 0 && (l.diasParado ?? 0) > 180);
  if (paradoLongo.length > 0) {
    pendencias.push({
      chave: 'parado',
      grave: false,
      titulo: `${paradoLongo.length} item(ns) sem mexer há mais de 6 meses`,
      detalhe: 'Tecido, retalho e aviamento parados: vale pensar em usar ou vender.',
      centavos: dona ? paradoLongo.reduce((s, l) => s + l.valorCentavos, 0) : undefined,
      href: '/estoque/parado',
      acao: 'Ver o que está parado',
    });
  }

  const pecasAbaixo = produtos.filter((p) => p.abaixoDoMinimo);
  if (pecasAbaixo.length > 0) {
    pendencias.push({
      chave: 'loja',
      grave: false,
      titulo: `${juntarNomes(pecasAbaixo.map((p) => [p.nome, p.tamanho].filter(Boolean).join(' ')))} acabando na loja`,
      detalhe: 'Peças prontas abaixo do mínimo',
      href: '/vendas/estoque',
      acao: 'Ver estoque da loja',
    });
  }

  const dataHoje = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const ultimaSemana = prev?.semanas.at(-1);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-fio pb-5">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">{saudacao()}</h1>
          <p className="mt-1 text-sm fraco first-letter:uppercase">{dataHoje}</p>
        </div>
        {usuario.papel !== 'producao' && <BotaoOcultar />}
      </div>

      {/* ── precisa de voce ───────────────────────────────────────── */}
      <section className="mt-7">
        <h2 className="text-rotulo font-bold uppercase text-gold">Precisa de você</h2>
        {pendencias.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-fio px-5 py-5 text-sm fraco">
            Tudo em dia. Nada esperando por você hoje.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
            {pendencias.map((p) => (
              <li key={p.chave} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${p.grave ? 'bg-alerta' : 'bg-gold'}`}
                />
                <div className="min-w-[200px] flex-1">
                  <p className="font-semibold">{p.titulo}</p>
                  {p.detalhe && <p className="miudo mt-0.5">{p.detalhe}</p>}
                </div>
                {p.centavos !== undefined && (
                  <Dinheiro centavos={p.centavos} className={`font-bold tabular-nums ${p.grave ? 'text-alerta' : ''}`} />
                )}
                <Link href={p.href} className="bt bt-vazio compacto py-2">
                  {p.acao} →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── tres numeros ──────────────────────────────────────────── */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {dona && financeiro ? (
          <>
            <Numero rotulo="Vendido no mês" href="/vendas/resumo?periodo=mes" nota={`${mes.quantidadeVendas} venda(s)`}>
              <Dinheiro centavos={mes.totalCentavos} />
            </Numero>
            <Numero
              rotulo="Caixa hoje"
              href="/financeiro"
              grave={financeiro.saldoCentavos < 0}
              nota={
                ultimaSemana ? (
                  <>
                    Previsto para {dataCurtaBR(ultimaSemana.fim)}: <Dinheiro centavos={ultimaSemana.saldoFimCentavos} />
                  </>
                ) : undefined
              }
            >
              <Dinheiro centavos={financeiro.saldoCentavos} />
            </Numero>
            <Numero
              rotulo="A pagar nos próximos 7 dias"
              href="/financeiro/pagar"
              nota={`${financeiro.pagarSeteDias.quantidade} conta(s)`}
            >
              <Dinheiro centavos={financeiro.pagarSeteDias.totalCentavos} />
            </Numero>
          </>
        ) : veLoja ? (
          <>
            <Numero rotulo="Vendido hoje" href="/vendas/resumo?periodo=hoje" nota={`${hojeVendas.quantidadeVendas} venda(s)`}>
              <Dinheiro centavos={hojeVendas.totalCentavos} />
            </Numero>
            <Numero rotulo="Vendido no mês" href="/vendas/resumo?periodo=mes" nota={`${mes.quantidadeVendas} venda(s)`}>
              <Dinheiro centavos={mes.totalCentavos} />
            </Numero>
            <Numero rotulo="Peças acabando na loja" href="/vendas/estoque" grave={pecasAbaixo.length > 0}>
              {pecasAbaixo.length}
            </Numero>
          </>
        ) : (
          <>
            <Numero rotulo="Itens abaixo do mínimo" href="/estoque" grave={tecidoAbaixo.length > 0} nota="Tecido e aviamento">
              {tecidoAbaixo.length}
            </Numero>
            <Numero rotulo="Itens no estoque" href="/estoque" nota="Tecido e aviamento cadastrados">
              {estoque.length}
            </Numero>
          </>
        )}
      </div>

      {/* ── ritmo das vendas ──────────────────────────────────────── */}
      {veLoja && porDia.length > 1 && (
        <section className="mt-9">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-rotulo font-bold uppercase text-gold">Vendas dos últimos 30 dias</h2>
            <Link href="/vendas/resumo" className="compacto text-rotulo font-bold uppercase text-gold">
              Ver resumo de vendas →
            </Link>
          </div>
          <div className="mt-3">
            <GraficoVendas pontos={porDia} altura={140} />
          </div>
        </section>
      )}
    </>
  );
}

function Numero({
  rotulo,
  href,
  nota,
  grave = false,
  children,
}: {
  rotulo: string;
  href: string;
  nota?: React.ReactNode;
  grave?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-1.5 rounded border bg-cream-alt p-5 transition-colors hover:border-gold ${
        grave ? 'border-alerta' : 'border-fio'
      }`}
    >
      <p className="text-rotulo font-semibold uppercase fraco">{rotulo}</p>
      <p className={`text-[1.75rem] font-bold leading-tight ${grave ? 'text-alerta' : ''}`}>{children}</p>
      {nota && <p className="text-sm fraco">{nota}</p>}
    </Link>
  );
}
