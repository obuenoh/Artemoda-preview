'use client';

import { useActionState } from 'react';
import { entrar } from './acoes';
import { Monograma } from '@/components/Marca';

export default function EntrarPage() {
  const [erro, acao, pendente] = useActionState(entrar, null);

  return (
    <main className="grid min-h-screen place-items-center bg-navy px-5 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex items-center gap-3">
          <Monograma tamanho={38} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cream">
            Arte e Moda
          </span>
        </div>

        <div className="rounded border border-fio-ouro bg-cream p-7">
          <h1 className="font-display text-2xl">Entrar no sistema</h1>
          <p className="mt-2 text-sm fraco">Use o e-mail e a senha que combinamos.</p>

          <form action={acao} className="mt-7 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="rotulo-campo">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                className="campo mt-2"
              />
            </div>

            <div>
              <label htmlFor="senha" className="rotulo-campo">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                className="campo mt-2"
              />
            </div>

            {erro && (
              <p role="alert" className="rounded-sm border border-alerta bg-alerta/5 px-3 py-2 text-sm">
                {erro}
              </p>
            )}

            <button type="submit" disabled={pendente} className="bt bt-cheio w-full">
              {pendente ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--texto-claro)]">
          Sistema de uso interno da Arte e Moda.
        </p>
      </div>
    </main>
  );
}
