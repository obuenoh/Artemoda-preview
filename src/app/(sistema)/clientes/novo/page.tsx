import { exigirPapel } from '@/lib/sessao';
import { TituloPagina } from '@/components/Ui';
import { FormCliente } from './FormCliente';

export const metadata = { title: 'Novo cliente' };

export default async function NovoClientePage() {
  await exigirPapel('dona', 'vendas');
  return (
    <>
      <TituloPagina titulo="Novo cliente" sub="Escola, empresa ou marca" />
      <FormCliente />
    </>
  );
}
