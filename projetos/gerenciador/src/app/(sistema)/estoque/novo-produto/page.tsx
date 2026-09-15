import { exigirPapel } from '@/lib/sessao';
import { listarTiposProduto } from '@/lib/estoque';
import { TituloPagina } from '@/components/Ui';
import { FormProduto } from './FormProduto';

export const metadata = { title: 'Novo produto' };

export default async function NovoProdutoEstoquePage() {
  const usuario = await exigirPapel('dona', 'producao');
  const tipos = await listarTiposProduto(usuario.empresaId);

  return (
    <>
      <TituloPagina
        titulo="Novo produto de estoque"
        sub="Tecido, etiqueta, elástico, zíper, agulha — ou um tipo novo que você criar"
      />
      <FormProduto
        tipos={tipos.map((t) => ({
          id: t.id,
          nome: t.nome,
          unidadePadrao: t.unidadePadrao,
          mostrarCamposTecido: t.mostrarCamposTecido,
        }))}
      />
    </>
  );
}
