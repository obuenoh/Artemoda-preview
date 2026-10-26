import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { posicaoEstoque, NOME_TIPO_RETALHO } from '@/lib/estoque';
import { milFormatado } from '@/lib/numeros';
import { TituloPagina, FaixaTotal } from '@/components/Ui';
import { Dinheiro, BotaoOcultar } from '@/components/Valores';
import { FormRetalho } from './FormRetalho';
import { LinhaRetalho } from './LinhaRetalho';

export const metadata = { title: 'Retalhos' };

/**
 * Retalho e dinheiro parado que ninguem conta. Aqui ela anota (tecido, cor,
 * kg) e ve quanto vale tudo junto — do mais parado para o mais novo.
 */
export default async function RetalhosPage() {
  const usuario = await exigirPapel('dona', 'producao');

  const [posicao, tecidosCadastro] = await Promise.all([
    posicaoEstoque(usuario.empresaId),
    db.materiaPrima.findMany({
      where: { empresaId: usuario.empresaId, ativo: true, tipoProduto: { mostrarCamposTecido: true } },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, cor: true, unidade: true, larguraMil: true, gramaturaGm2: true },
    }),
  ]);

  const custoPorId = new Map(posicao.map((l) => [l.id, l.custoMedioCentavos]));
  const tecidos = tecidosCadastro.map((t) => ({ ...t, custoMedioCentavos: custoPorId.get(t.id) ?? 0 }));

  const retalhos = posicao
    .filter((l) => l.tipoProdutoNome === NOME_TIPO_RETALHO && l.saldoMil > 0)
    .sort((a, b) => (b.diasParado ?? 0) - (a.diasParado ?? 0));

  const kg = retalhos.reduce((s, l) => s + l.saldoMil, 0);
  const total = retalhos.reduce((s, l) => s + l.valorCentavos, 0);
  const longo = retalhos.filter((l) => (l.diasParado ?? 0) > 180).reduce((s, l) => s + l.valorCentavos, 0);

  return (
    <>
      <TituloPagina
        titulo="Retalhos"
        sub="Sobras de tecido, pesadas em kg: o que tem e quanto vale"
        acao={<BotaoOcultar />}
      />

      <FaixaTotal>
        <span className="text-sm text-[color:var(--texto-claro)]">Você tem</span>
        <span className="text-2xl font-bold">{milFormatado(kg, 'kg')}</span>
        <span className="text-sm text-[color:var(--texto-claro)]">
          de retalho, cerca de <strong className="text-cream"><Dinheiro centavos={total} /></strong> parados
        </span>
        {longo > 0 && (
          <span className="text-sm text-[color:var(--texto-claro)]">
            · <strong className="text-cream"><Dinheiro centavos={longo} /></strong> há mais de 6 meses
          </span>
        )}
      </FaixaTotal>

      <section className="mt-8">
        <h2 className="text-rotulo font-bold uppercase text-gold">Anotar retalho</h2>
        <p className="miudo mt-1">Pese, escolha o tecido e a cor. Retalho do mesmo tecido e da mesma cor soma junto.</p>
        <div className="mt-3">
          <FormRetalho tecidos={tecidos} />
        </div>
      </section>

      <section className="mt-9">
        <h2 className="text-rotulo font-bold uppercase text-gold">O que tem</h2>
        {retalhos.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-fio px-5 py-5 text-sm fraco">
            Nenhum retalho anotado ainda. Comece pela pilha mais antiga.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
            {retalhos.map((l) => (
              <LinhaRetalho
                key={l.id}
                r={{
                  id: l.id,
                  nome: l.nome,
                  cor: l.cor,
                  quantidade: milFormatado(l.saldoMil, 'kg'),
                  custoKgCentavos: l.custoMedioCentavos,
                  localizacao: l.localizacao,
                  diasParado: l.diasParado,
                  valorCentavos: l.valorCentavos,
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
