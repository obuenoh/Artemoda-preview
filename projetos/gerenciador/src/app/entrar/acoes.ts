'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { conferirSenha } from '@/lib/senha';
import { criarSessao, encerrarSessao } from '@/lib/sessao';

export async function entrar(_estado: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const senha = String(form.get('senha') ?? '');

  if (!email) return 'Digite o seu e-mail.';
  if (!senha) return 'Digite a sua senha.';

  const usuario = await db.usuario.findUnique({ where: { email } });

  // Mensagem unica para e-mail errado e senha errada: nao entrega a
  // quem tenta adivinhar qual dos dois existe.
  if (!usuario || !usuario.ativo || !conferirSenha(senha, usuario.senhaHash)) {
    return 'E-mail ou senha não confere. Confira e tente de novo.';
  }

  await criarSessao(usuario.id);
  redirect('/');
}

export async function sair() {
  await encerrarSessao();
  redirect('/entrar');
}
