import Link from 'next/link';
import type { ReactNode } from 'react';

export function TituloPagina({
  titulo,
  sub,
  acao,
}: {
  titulo: string;
  sub?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-fio pb-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">{titulo}</h1>
        {sub && <p className="mt-1 text-sm fraco">{sub}</p>}
      </div>
      {acao}
    </div>
  );
}

/** Faixa de total — o numero que resume a tela, em destaque escuro. */
export function FaixaTotal({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded bg-navy-deep px-5 py-4 text-cream">
      {children}
    </div>
  );
}

export function Vazio({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="mt-6 rounded border border-dashed border-fio-ouro p-8 text-center">
      <p className="font-display text-xl">{titulo}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm fraco">{texto}</p>
      {acao && <div className="mt-5 flex justify-center">{acao}</div>}
    </div>
  );
}

export function Aviso({
  tom = 'neutro',
  children,
}: {
  tom?: 'neutro' | 'alerta';
  children: ReactNode;
}) {
  return (
    <div
      className={`mt-4 rounded border px-4 py-3 text-sm ${
        tom === 'alerta' ? 'border-alerta bg-alerta/5 text-ink' : 'border-dashed border-fio-ouro fraco'
      }`}
    >
      {children}
    </div>
  );
}

export function Botao({
  href,
  children,
  variante = 'cheio',
  ...rest
}: {
  href?: string;
  children: ReactNode;
  variante?: 'cheio' | 'vazio' | 'perigo';
} & React.ComponentProps<'button'>) {
  const cls = `bt bt-${variante === 'cheio' ? 'cheio' : variante === 'vazio' ? 'vazio' : 'perigo'}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
