import { exigirUsuario } from '@/lib/sessao';
import { Abas } from '@/components/Abas';

export default async function VendasLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  return (
    <>
      <Abas
        rotulo="Vendas"
        itens={[
          { href: '/vendas', rotulo: 'Vender' },
          // O resumo tem os totais de venda: so quem vende e a dona.
          ...(usuario.papel !== 'producao' ? [{ href: '/vendas/resumo', rotulo: 'Resumo' }] : []),
          { href: '/vendas/estoque', rotulo: 'Estoque da loja' },
        ]}
      />
      {children}
    </>
  );
}
