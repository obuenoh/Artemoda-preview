import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * scrypt do proprio Node — sem dependencia externa para algo tao sensivel.
 * Formato guardado: scrypt$<sal-hex>$<hash-hex>
 */

export function criarHash(senha: string): string {
  const sal = randomBytes(16);
  const hash = scryptSync(senha, sal, 64);
  return `scrypt$${sal.toString('hex')}$${hash.toString('hex')}`;
}

export function conferirSenha(senha: string, guardado: string): boolean {
  const [algoritmo, salHex, hashHex] = guardado.split('$');
  if (algoritmo !== 'scrypt' || !salHex || !hashHex) return false;

  const hash = Buffer.from(hashHex, 'hex');
  const tentativa = scryptSync(senha, Buffer.from(salHex, 'hex'), hash.length);

  // Comparacao em tempo constante: nao vaza informacao pelo tempo de resposta.
  return timingSafeEqual(hash, tentativa);
}
