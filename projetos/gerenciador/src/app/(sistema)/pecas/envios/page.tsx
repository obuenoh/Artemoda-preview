import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { dataBR } from '@/lib/numeros';
import { rotuloFrente } from '@/lib/frentes';
import { TituloPagina, Vazio } from '@/components/Ui';

export const metadata = { title: 'Envios de peças' };

/** O que saiu de uma frente para outra, do mais recente para o mais antigo. */
export default async function EnviosPage() {
  const usuario = await exigirUsuario();

  const envios = await db.envioPecas.findMany({
    where: { empresaId: usuario.empresaId },
    orderBy: { criadoEm: 'desc' },
    take: 60,
  });
  const ids = envios.map((e) => e.id);
  const [movimentos, usuarios] = await Promise.all([
    db.movimentoProdutoAcabado.findMany({
      where: { empresaId: usuario.empresaId, origemTipo: 'envio', origemId: { in: ids }, tipo: 'envio_entrada' },
      include: { produtoAcabado: { select: { nome: true, tamanho: true, cor: true } } },
    }),
    db.usuario.findMany({ where: { empresaId: usuario.empresaId }, select: { id: true, nome: true } }),
  ]);
  const nomeUsuario = new Map(usuarios.map((u) => [u.id, u.nome]));

  return (
    <>
      <TituloPagina titulo="Envios de peças" sub="Peça que mudou de frente. Não é venda: o dinheiro não saiu da empresa" />

      {envios.length === 0 ? (
        <Vazio
          titulo="Nenhum envio ainda."
          texto="Em Estoque de peças, use Enviar na linha da peça para mandar da Fábrica para a Loja ou o E-commerce."
        />
      ) : (
        <ul className="mt-6 divide-y divide-[color:var(--fio)] rounded border border-fio">
          {envios.map((e) => {
            const itens = movimentos.filter((m) => m.origemId === e.id);
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-3 text-sm">
                <span className="font-semibold">{dataBR(e.criadoEm)}</span>
                <span>
                  {rotuloFrente(e.de)} <span className="text-gold">→</span> <strong>{rotuloFrente(e.para)}</strong>
                </span>
                <span className="flex-1">
                  {itens
                    .map((m) => `${m.quantidade} × ${[m.produtoAcabado.nome, m.produtoAcabado.tamanho, m.produtoAcabado.cor].filter(Boolean).join(' · ')}`)
                    .join(', ')}
                </span>
                <span className="miudo">{e.usuarioId ? nomeUsuario.get(e.usuarioId) : ''}</span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
