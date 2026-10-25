import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { campoDeData } from '@/lib/numeros';
import { TituloPagina } from '@/components/Ui';
import { FormConta } from '../../FormConta';

export const metadata = { title: 'Nova conta a pagar' };

export default async function NovaContaPagarPage() {
  const usuario = await exigirPapel('dona');
  const fornecedores = await db.fornecedor.findMany({
    where: { empresaId: usuario.empresaId, ativo: true },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true },
  });

  return (
    <>
      <TituloPagina
        titulo="Nova conta a pagar"
        sub="Compra de tecido a prazo já entra sozinha — aqui é o resto: aluguel, luz, bordado, boleto"
      />
      <FormConta tipo="pagar" pessoas={fornecedores} hoje={campoDeData(new Date())} />
    </>
  );
}
