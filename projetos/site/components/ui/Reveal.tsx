'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Revelacao no scroll: fade + translate curto, uma vez so.
 *
 * IMPORTANTE: nao ramifique a marcacao com useReducedMotion() aqui.
 * O servidor nao sabe a preferencia do usuario, entao renderizar um
 * elemento diferente no cliente gera mismatch de hidratacao — e o React
 * nao corrige atributo de style nesse caso, deixando o conteudo preso em
 * opacity:0 para quem usa "reduzir movimento".
 *
 * A preferencia e respeitada em <MotionProvider> (MotionConfig
 * reducedMotion="user"), que desliga o deslocamento e mantem so o fade.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
