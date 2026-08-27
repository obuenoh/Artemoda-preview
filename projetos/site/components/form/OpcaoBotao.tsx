/**
 * Opcao em botao grande e tocavel. No mobile o alvo tem 56px de altura —
 * quem chega de anuncio no celular decide com o polegar.
 */
export function OpcaoBotao({
  label,
  selecionado,
  onClick,
  tipo = 'radio',
  descricao,
}: {
  label: string;
  selecionado: boolean;
  onClick: () => void;
  tipo?: 'radio' | 'checkbox';
  descricao?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={tipo === 'radio' ? 'radio' : 'checkbox'}
      aria-checked={selecionado}
      className={`flex min-h-[56px] w-full items-center gap-4 rounded-sm border px-4 py-3 text-left transition-colors duration-300 ease-seam ${
        selecionado
          ? 'border-gold bg-gold/10'
          : 'border-ink/15 hover:border-gold/60'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
          tipo === 'radio' ? 'rounded-full' : 'rounded-[1px]'
        } ${selecionado ? 'border-gold' : 'border-ink/30'}`}
      >
        {selecionado && (
          <span
            className={`block h-2 w-2 bg-gold ${tipo === 'radio' ? 'rounded-full' : 'rounded-[1px]'}`}
          />
        )}
      </span>
      <span>
        <span className="block font-sans text-[0.9375rem] font-medium text-ink">{label}</span>
        {descricao && (
          <span className="mt-0.5 block font-sans text-[0.8125rem] text-muted-on-light">
            {descricao}
          </span>
        )}
      </span>
    </button>
  );
}
