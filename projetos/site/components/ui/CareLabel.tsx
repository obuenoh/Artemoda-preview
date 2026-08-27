/**
 * Tipografia de etiqueta de composicao — a que vem costurada na gola.
 * Substitui o "icone + titulo + paragrafo" generico por um detalhe
 * tipografico que ainda carrega informacao util.
 */
export function CareLabel({
  items,
  tone = 'dark',
  className = '',
}: {
  items: readonly string[];
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <p
      className={`font-sans text-label font-medium uppercase ${
        tone === 'dark' ? 'text-muted-on-dark' : 'text-muted-on-light'
      } ${className}`}
    >
      {items.map((item, i) => (
        <span key={item}>
          {i > 0 && <span className="mx-2 text-gold">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
}
