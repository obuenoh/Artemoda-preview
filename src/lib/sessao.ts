import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { redirect } from 'next/navigation';
import { db } from './db';

const COOKIE = 'am_sessao';
const DIAS = 14;

export type Papel = 'dona' | 'producao' | 'vendas';

export const rotuloPapel: Record<Papel, string> = {
  dona: 'Dona',
  producao: 'Produção',
  vendas: 'Vendas',
};

export type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  empresaId: string;
  empresaNome: string;
};

export async function criarSessao(usuarioId: string) {
  const token = randomBytes(32).toString('hex');
  const expiraEm = new Date(Date.now() + DIAS * 86_400_000);

  await db.sessao.create({ data: { token, usuarioId, expiraEm } });

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: expiraEm,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.sessao.deleteMany({ where: { token } });
  jar.delete(COOKIE);
}

export async function usuarioAtual(): Promise<UsuarioSessao | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const sessao = await db.sessao.findUnique({
    where: { token },
    include: { usuario: { include: { empresa: true } } },
  });

  if (!sessao || sessao.expiraEm < new Date() || !sessao.usuario.ativo) return null;

  return {
    id: sessao.usuario.id,
    nome: sessao.usuario.nome,
    email: sessao.usuario.email,
    papel: sessao.usuario.papel as Papel,
    empresaId: sessao.usuario.empresaId,
    empresaNome: sessao.usuario.empresa.nome,
  };
}

/** Usar em toda pagina e toda server action. Redireciona se nao houver sessao. */
export async function exigirUsuario(): Promise<UsuarioSessao> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect('/entrar');
  return usuario;
}

/** Papeis permitidos por area. Financeiro so a dona ve (Fase 3). */
export async function exigirPapel(...papeis: Papel[]): Promise<UsuarioSessao> {
  const usuario = await exigirUsuario();
  if (!papeis.includes(usuario.papel)) redirect('/sem-acesso');
  return usuario;
}

export async function registrarAuditoria(dados: {
  empresaId: string;
  usuarioId?: string;
  entidade: string;
  entidadeId: string;
  acao: string;
  resumo: string;
}) {
  await db.auditoria.create({ data: dados });
}
