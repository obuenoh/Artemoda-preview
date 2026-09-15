/**
 * Sai com codigo 0 se o banco precisa de seed (tabela ainda nao existe
 * ou nao ha nenhum usuario) e 1 se ja tem dados.
 *
 * O seed usa create() e nao upsert(), entao rodar duas vezes duplicaria
 * tudo. Qualquer erro inesperado aborta com codigo 2: e mais seguro
 * falhar o deploy do que popular um banco que ja tinha dados.
 */
import { PrismaClient } from '@prisma/client';

// Codigos do Prisma que significam "banco/tabela ainda nao existe".
const AUSENTE = new Set(['P2021', 'P1003']);

const prisma = new PrismaClient();

try {
  const total = await prisma.usuario.count();
  process.exit(total === 0 ? 0 : 1);
} catch (erro) {
  if (AUSENTE.has(erro?.code)) {
    process.exit(0);
  }
  console.error('[banco-vazio] Erro inesperado ao consultar o banco:', erro);
  process.exit(2);
} finally {
  await prisma.$disconnect();
}
