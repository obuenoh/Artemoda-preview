import { exigirUsuario } from '@/lib/sessao';
import { Abas } from '@/components/Abas';

export default async function EstoqueLayout({ children }: { children: React.ReactNode }) {
  await exigirUsuario();
  return (
    <>
      <Abas
        rotulo="Estoque"
        itens={[
          { href: '/estoque', rotulo: 'Tecido e aviamento' },
          { href: '/estoque/retalhos', rotulo: 'Retalhos' },
          { href: '/estoque/parado', rotulo: 'O que está parado' },
        ]}
      />
      {children}
    </>
  );
}
