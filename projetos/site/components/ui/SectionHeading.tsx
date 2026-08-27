import { Eyebrow } from './Eyebrow';

/**
 * Titulo de secao fiel ao manual: Montserrat 600, caixa alta, tracking largo.
 * A serifa (Cormorant) fica reservada para display — hero, citacao e numeral.
 */
export function SectionHeading({
  eyebrow,
  titulo,
  intro,
  tone = 'dark',
  align = 'left',
  className = '',
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  titulo: string;
  intro?: string;
  tone?: 'dark' | 'light';
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  const isDark = tone === 'dark';
  return (
    <div
      className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-measure ${className}`}
    >
      {eyebrow && (
        <Eyebrow className={align === 'center' ? 'justify-center' : ''}>{eyebrow}</Eyebrow>
      )}
      <Tag
        className={`mt-5 font-sans text-section font-semibold uppercase ${
          isDark ? 'text-cream' : 'text-ink'
        }`}
      >
        {titulo}
      </Tag>
      {intro && (
        <p
          className={`mt-6 text-body ${isDark ? 'text-muted-on-dark' : 'text-muted-on-light'}`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
