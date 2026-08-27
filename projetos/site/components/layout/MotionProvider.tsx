'use client';

import { MotionConfig } from 'framer-motion';

/**
 * `reducedMotion="user"` faz o Framer Motion respeitar
 * prefers-reduced-motion sem que nenhum componente precise ramificar a
 * marcacao: deslocamento e escala sao ignorados, o fade continua.
 *
 * Isso resolve na raiz o mismatch de hidratacao que deixava a pagina em
 * branco para quem tem "reduzir movimento" ligado no sistema.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
