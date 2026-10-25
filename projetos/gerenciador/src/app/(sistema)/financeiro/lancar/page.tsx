import { exigirPapel } from '@/lib/sessao';
import { campoDeData } from '@/lib/numeros';
import { TituloPagina } from '@/components/Ui';
import { FormAvulso } from './FormAvulso';

export const metadata = { title: 'Lançar no caixa' };

export default async function LancarPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  await exigirPapel('dona');
  const { tipo } = await searchParams;

  return (
    <>
      <TituloPagina
        titulo="Lançar no caixa"
        sub="Dinheiro que entrou ou saiu sem conta cadastrada. Venda bipada e conta paga já entram sozinhas"
      />
      <FormAvulso tipoInicial={tipo === 'entrada' ? 'entrada' : 'saida'} hoje={campoDeData(new Date())} />
    </>
  );
}
