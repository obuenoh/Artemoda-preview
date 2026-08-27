export function Monograma({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-sm border border-gold font-display leading-none text-gold"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.48 }}
    >
      AM
    </span>
  );
}
