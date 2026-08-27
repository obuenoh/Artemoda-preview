import type { ReactNode } from 'react';

/** Rotulo sempre visivel; erro especifico logo abaixo do campo. */
export function Campo({
  id,
  label,
  erro,
  ajuda,
  opcional,
  children,
  className = '',
}: {
  id: string;
  label: string;
  erro?: string;
  ajuda?: string;
  opcional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="rotulo-campo flex items-baseline justify-between gap-3">
        {label}
        {opcional && <span className="font-normal normal-case tracking-normal">opcional</span>}
      </label>
      <div className="mt-2">{children}</div>
      {ajuda && !erro && <p className="mt-1.5 text-xs fraco">{ajuda}</p>}
      {erro && (
        <p role="alert" className="mt-1.5 text-sm">
          <span aria-hidden="true" className="mr-1.5 text-gold">↳</span>
          {erro}
        </p>
      )}
    </div>
  );
}

export function ErroGeral({ erro }: { erro?: string }) {
  if (!erro) return null;
  return (
    <p role="alert" className="rounded-sm border border-alerta bg-alerta/5 px-3 py-2.5 text-sm">
      {erro}
    </p>
  );
}
