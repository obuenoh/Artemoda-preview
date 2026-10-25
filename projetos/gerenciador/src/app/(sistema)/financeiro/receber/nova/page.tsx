import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { campoDeData } from '@/lib/numeros';
import { TituloPagina } from '@/components/Ui';
import { FormConta } from '../../FormConta';

export const metadata = { title: 'Nova conta a receber' };

export default async function NovaContaReceberPage() {
  const usuario = await exigirPapel('dona');
  const clientes = await db.cliente.findMany({
    where: { empresaId: usuario.empresaId, ativo: true },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true },
  });

  return (
    <>
      <TituloPagina
        titulo="Nova conta a receber"
        sub="Venda fiado já entra sozinha — aqui é o combinado fora do balcão, como o restante na entrega"
      />
      <FormConta tipo="receber" pessoas={clientes} hoje={campoDeData(new Date())} />
    </>
  );
}
