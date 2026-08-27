import { clientes } from '@/data/clientes';

/**
 * Faixa fina de credibilidade. Nomes em cinza que ganham cor no hover.
 * Para adicionar cliente ou logo, basta editar data/clientes.ts —
 * a faixa cresce sozinha.
 */
export function ProofBar() {
  return (
    <section aria-label="Clientes e parceiros" className="border-y border-hairline bg-navy-deep">
      <div className="container-am flex flex-col gap-6 py-8 md:flex-row md:items-center md:gap-12 md:py-6">
        <p className="shrink-0 font-sans text-label font-semibold uppercase text-gold">
          Atendemos
        </p>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-4">
          {clientes.map((cliente) => (
            <li
              key={cliente.nome}
              className="font-sans text-[0.75rem] font-medium uppercase tracking-[0.18em] text-gray transition-colors duration-300 hover:text-cream"
            >
              {cliente.nome}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
