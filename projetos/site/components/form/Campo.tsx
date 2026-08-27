import type { ReactNode } from 'react';

/** Rotulo sempre visivel + erro especifico logo abaixo do campo. */
export function Campo({
  id,
  label,
  erro,
  children,
  opcional = false,
  className = '',
}: {
  id: string;
  label: string;
  erro?: string;
  children: ReactNode;
  opcional?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 font-sans text-label font-semibold uppercase text-ink"
      >
        {label}
        {opcional && <span className="font-normal text-muted-on-light">opcional</span>}
      </label>
      <div className="mt-2">{children}</div>
      {erro && (
        <p id={`${id}-erro`} role="alert" className="mt-2 text-body-sm text-ink">
          <span aria-hidden="true" className="mr-2 text-gold">
            ↳
          </span>
          {erro}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  'w-full rounded-sm border border-ink/20 bg-transparent px-4 py-3 font-sans text-[0.9375rem] text-ink placeholder:text-ink/35 transition-colors duration-300 focus:border-gold focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-gold';
