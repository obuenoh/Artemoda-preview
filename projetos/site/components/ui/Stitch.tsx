'use client';

import { motion } from 'framer-motion';

/**
 * Pesponto (topstitch). Geometria de costura de verdade: traco 6 /
 * intervalo 4, espessura 1, ponta reta. Nos vertices, furo de agulha.
 *
 * Nao e uma linha decorativa flutuando no meio da tela — ele acompanha
 * emenda entre paineis e perimetro de bloco aplicado, como o pesponto
 * de acabamento fica dentro da costura de uma peca.
 *
 * Nenhum componente daqui ramifica a marcacao por preferencia de
 * movimento: quem cuida disso e o <MotionProvider> na raiz. Ver a nota
 * em components/ui/Reveal.tsx.
 */

const DASH = '6 4';

export function SeamStitch({
  className = '',
  needleHoles = true,
}: {
  className?: string;
  needleHoles?: boolean;
}) {
  return (
    <svg
      className={`h-[3px] w-full overflow-visible ${className}`}
      preserveAspectRatio="none"
      viewBox="0 0 100 3"
      aria-hidden="true"
      focusable="false"
    >
      <motion.line
        x1="0"
        y1="1.5"
        x2="100"
        y2="1.5"
        stroke="#B58B57"
        strokeWidth="1"
        strokeLinecap="butt"
        strokeDasharray={DASH}
        vectorEffect="non-scaling-stroke"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.75 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      {needleHoles && (
        <>
          <circle cx="0" cy="1.5" r="1.5" fill="#B58B57" opacity="0.6" />
          <circle cx="100" cy="1.5" r="1.5" fill="#B58B57" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

/**
 * Pesponto no perimetro de um bloco aplicado — igual bolso chapado.
 * Envolve o conteudo; o traco fica 14px para dentro da borda.
 */
export function StitchedPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[14px] rounded-sm border border-dashed border-gold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.55 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {children}
    </div>
  );
}

/** Pesponto vertical — liga as etapas do processo no mobile. */
export function StitchRail({ className = '' }: { className?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`w-px bg-[repeating-linear-gradient(to_bottom,#B58B57_0px,#B58B57_6px,transparent_6px,transparent_10px)] ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.7 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
