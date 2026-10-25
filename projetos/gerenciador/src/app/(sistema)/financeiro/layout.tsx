import { exigirPapel } from '@/lib/sessao';
import { Abas } from '@/components/Abas';
import { BotaoOcultar } from '@/components/Valores';

/** Financeiro e so da dona: produção e vendas nem chegam a ver as abas. */
export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  await exigirPapel('dona');
  return (
    <>
      <Abas
        rotulo="Financeiro"
        itens={[
          { href: '/financeiro', rotulo: 'Caixa' },
          { href: '/financeiro/pagar', rotulo: 'A pagar' },
          { href: '/financeiro/receber', rotulo: 'A receber' },
        ]}
        direita={<BotaoOcultar />}
      />
      {children}
    </>
  );
}
