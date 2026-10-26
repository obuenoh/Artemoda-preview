import { exigirUsuario } from '@/lib/sessao';
import { Abas } from '@/components/Abas';

export default async function PecasLayout({ children }: { children: React.ReactNode }) {
  await exigirUsuario();
  return (
    <>
      <Abas
        rotulo="Peças"
        itens={[
          { href: '/pecas', rotulo: 'Estoque de peças' },
          { href: '/pecas/envios', rotulo: 'Envios' },
        ]}
      />
      {children}
    </>
  );
}
