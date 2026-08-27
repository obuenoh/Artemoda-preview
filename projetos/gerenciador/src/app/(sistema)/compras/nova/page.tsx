import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';
import { FormCompra } from './FormCompra';

export const metadata = { title: 'Registrar compra' };

export default async function NovaCompraPage({
  searchParams,
}: {
  searchParams: Promise<{ tecido?: string }>;
}) {
  const { tecido } = await searchParams;
  const usuario = await exigirPapel('dona', 'producao');

  const [fornecedores, tecidos] = await Promise.all([
    db.fornecedor.findMany({
      where: { empresaId: usuario.empresaId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
    db.materiaPrima.findMany({
      where: { empresaId: usuario.empresaId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ]);

  const vendedores = fornecedores.filter((f) =>
    f.tipos.split(',').some((t) => ['tecido', 'aviamento', 'outro'].includes(t.trim())),
  );

  if (vendedores.length === 0 || tecidos.length === 0) {
    return (
      <>
        <TituloPagina titulo="Registrar compra" />
        <Vazio
          titulo="Falta cadastro antes de comprar."
          texto={
            vendedores.length === 0
              ? 'Cadastre primeiro o fornecedor de quem você compra tecido.'
              : 'Cadastre primeiro os tecidos que você compra.'
          }
          acao={
            <Botao href={vendedores.length === 0 ? '/fornecedores/novo' : '/tecidos/novo'}>
              {vendedores.length === 0 ? 'Cadastrar fornecedor' : 'Cadastrar tecido'}
            </Botao>
          }
        />
      </>
    );
  }

  return (
    <>
      <TituloPagina
        titulo="Registrar compra"
        sub="O frete é dividido entre os itens pelo sistema — você não precisa calcular"
      />
      <FormCompra
        fornecedores={vendedores.map((f) => ({ id: f.id, nome: f.nome }))}
        tecidos={tecidos.map((t) => ({
          id: t.id,
          nome: `${t.nome}${t.cor ? ` · ${t.cor}` : ''}`,
          unidade: t.unidade,
        }))}
        tecidoInicial={tecido ?? ''}
        hoje={new Date().toISOString().slice(0, 10)}
      />
    </>
  );
}
