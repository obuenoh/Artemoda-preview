import { exigirPapel } from '@/lib/sessao';
import { TituloPagina } from '@/components/Ui';
import { FormFornecedor } from './FormFornecedor';

export const metadata = { title: 'Novo fornecedor' };

export default async function NovoFornecedorPage() {
  await exigirPapel('dona', 'producao');
  return (
    <>
      <TituloPagina titulo="Novo fornecedor" sub="Quem vende ou quem faz serviço para você" />
      <FormFornecedor />
    </>
  );
}
