import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'outline-light' | 'outline-dark' | 'quiet';

const styles: Record<Variant, string> = {
  // Unico preenchimento solido em dourado do projeto inteiro (com o monograma).
  primary:
    'bg-gold text-ink border border-gold hover:bg-transparent hover:text-gold',
  'outline-light':
    'border border-cream/40 text-cream hover:border-gold hover:text-gold',
  'outline-dark':
    'border border-ink/25 text-ink hover:border-gold hover:text-gold',
  quiet: 'border border-transparent text-gold hover:text-cream',
};

const shared =
  'inline-flex items-center justify-center gap-2 rounded-sm px-7 min-h-[48px] font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-seam disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'className'>)
  | ({ href?: undefined } & Omit<ComponentProps<'button'>, 'className'>)
);

export function Button({ children, variant = 'primary', className = '', ...rest }: Props) {
  const cls = `${shared} ${styles[variant]} ${className}`;

  if (rest.href) {
    const { href, ...linkRest } = rest as { href: string };
    const external = href.startsWith('http') || href.startsWith('mailto:');
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...linkRest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as ComponentProps<'button'>)}>
      {children}
    </button>
  );
}
