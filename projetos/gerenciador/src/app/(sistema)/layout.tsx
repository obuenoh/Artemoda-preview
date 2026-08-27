import { exigirUsuario } from '@/lib/sessao';
import { sair } from '../entrar/acoes';
import { Navegacao } from './Navegacao';

export default async function SistemaLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  return (
    <div className="min-h-screen">
      <Navegacao papel={usuario.papel} nome={usuario.nome} sair={sair} />
      <main className="mx-auto max-w-[1240px] px-4 py-7 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
