type Props = {
  children: React.ReactNode;
  className?: string;
  /** Sobre fundo claro o risco de giz continua dourado; muda so o texto. */
  tone?: 'gold' | 'ink';
};

/** Sobretitulo com a marca de giz do alfaiate (risco de 24px). */
export function Eyebrow({ children, className = '', tone = 'gold' }: Props) {
  return (
    <p
      className={`chalk-rule flex items-center font-sans text-eyebrow font-semibold uppercase ${
        tone === 'gold' ? 'text-gold' : 'text-ink'
      } ${className}`}
    >
      {children}
    </p>
  );
}
