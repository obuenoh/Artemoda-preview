import { exigirPapel } from '@/lib/sessao';
import { TituloPagina } from '@/components/Ui';
import { FormPeca } from './FormPeca';

export const metadata = { title: 'Nova peça' };

export default async function NovaPecaPage() {
  await exigirPapel('dona', 'vendas', 'producao');
  return (
    <>
      <TituloPagina titulo="Nova peça" sub="Cada tamanho e cor tem o próprio código" />
      <FormPeca />
    </>
  );
}
