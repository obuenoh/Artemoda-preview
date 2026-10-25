import { exigirPapel } from '@/lib/sessao';
import { Dinheiro } from '@/components/Valores';
import { saldoCaixa, temAbertura } from '@/lib/financeiro';
import { TituloPagina, FaixaTotal } from '@/components/Ui';
import { FormConferir } from './FormConferir';

export const metadata = { title: 'Conferir o caixa' };

/** Igual a contagem de estoque: ela conta, o sistema compara, a diferenca entra com motivo. */
export default async function ConferirPage() {
  const usuario = await exigirPapel('dona');
  const [abriu, saldo] = await Promise.all([temAbertura(usuario.empresaId), saldoCaixa(usuario.empresaId)]);

  return (
    <>
      <TituloPagina
        titulo={abriu ? 'Conferir o caixa' : 'Saldo de abertura'}
        sub={
          abriu
            ? 'Conte o que tem e compare com o sistema. A diferença vira ajuste, com motivo'
            : 'A partir de hoje o caixa começa com o valor que você informar'
        }
      />
      {abriu && (
        <FaixaTotal>
          <span className="text-sm text-[color:var(--texto-claro)]">O sistema mostra</span>
          <span className="text-2xl font-bold">{<Dinheiro centavos={saldo} />}</span>
        </FaixaTotal>
      )}
      <FormConferir abriu={abriu} />
    </>
  );
}
