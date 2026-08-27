import Link from 'next/link';

export default function SemAcessoPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="font-display text-3xl">Esta parte não é do seu acesso.</h1>
        <p className="mx-auto mt-3 max-w-[44ch] text-sm fraco">
          O seu usuário não tem permissão para ver esta tela. Se precisar entrar aqui, fale com a
          dona para liberar.
        </p>
        <Link href="/" className="bt bt-vazio mt-7">
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
