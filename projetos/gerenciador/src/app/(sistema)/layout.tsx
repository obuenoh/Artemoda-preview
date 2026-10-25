import { cookies } from 'next/headers';
import { exigirUsuario } from '@/lib/sessao';
import { ProvedorValores } from '@/components/Valores';
import { COOKIE_VALORES } from '@/lib/preferencias';
import { sair } from '../entrar/acoes';
import { Navegacao } from './Navegacao';

export default async function SistemaLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  // Lido no servidor: a pagina ja nasce com os valores escondidos, sem piscar.
  const ocultos = (await cookies()).get(COOKIE_VALORES)?.value === 'ocultos';

  return (
    <ProvedorValores ocultosInicial={ocultos}>
      <div className="min-h-screen">
        <Navegacao papel={usuario.papel} nome={usuario.nome} sair={sair} />
        <main className="mx-auto max-w-[1240px] px-4 py-7 md:px-6 md:py-10">{children}</main>
      </div>
    </ProvedorValores>
  );
}
