import { exigirPapel } from '@/lib/sessao';
import { TituloPagina } from '@/components/Ui';
import { FormTecido } from './FormTecido';

export const metadata = { title: 'Novo tecido' };

export default async function NovoTecidoPage() {
  await exigirPapel('dona', 'producao');
  return (
    <>
      <TituloPagina titulo="Novo tecido" sub="Cada cor é um cadastro separado" />
      <p className="mt-4 max-w-[62ch] rounded border border-dashed border-fio-ouro px-4 py-3 text-sm fraco">
        Cadastre a mesma malha em cores diferentes como tecidos diferentes. Se ficarem juntas, o
        custo médio mistura preços que não têm nada a ver um com o outro.
      </p>
      <FormTecido />
    </>
  );
}
