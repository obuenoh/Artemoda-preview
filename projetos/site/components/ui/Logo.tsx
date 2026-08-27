import Link from 'next/link';

/**
 * Marca aplicada tipograficamente: monograma AM em dourado + wordmark
 * ARTE E MODA em Montserrat com tracking largo.
 *
 * TODO: o arquivo oficial da logo (clara e escura) nao foi entregue.
 * Quando chegar, trocar o bloco do monograma por <Image> e manter a
 * mesma caixa — proporcao, cor e espacamento ja estao reservados.
 */
export function Logo({
  tone = 'light',
  size = 'md',
  href = '/',
  showWordmark = true,
}: {
  /** `light` = logo clara sobre fundo escuro. `dark` = escura sobre claro. */
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  href?: string | null;
  showWordmark?: boolean;
}) {
  const dims = {
    sm: { box: 'h-8 w-8 text-lg', word: 'text-[0.625rem] tracking-[0.28em]' },
    md: { box: 'h-10 w-10 text-xl', word: 'text-[0.6875rem] tracking-[0.3em]' },
    lg: { box: 'h-14 w-14 text-3xl', word: 'text-[0.8125rem] tracking-[0.32em]' },
  }[size];

  const wordColor = tone === 'light' ? 'text-cream' : 'text-ink';

  const content = (
    <span className="inline-flex items-center gap-3">
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm border border-gold font-display-mid leading-none text-gold ${dims.box}`}
        aria-hidden="true"
      >
        AM
      </span>
      {showWordmark && (
        <span className={`font-sans font-semibold uppercase ${dims.word} ${wordColor}`}>
          Arte e Moda
        </span>
      )}
    </span>
  );

  if (!href) {
    return <span className="inline-flex">{content}</span>;
  }

  return (
    <Link href={href} className="inline-flex" aria-label="Arte e Moda — página inicial">
      {content}
    </Link>
  );
}
