import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { depoimentos } from '@/data/depoimentos';

/**
 * Tres slots prontos. Nenhum cliente inventado: enquanto nao houver
 * depoimento real, o slot aparece marcado como pendente — e melhor um
 * espaco honesto do que um elogio fabricado.
 */
export function Depoimentos() {
  return (
    <section className="section-y bg-cream text-ink">
      <div className="container-am">
        <SectionHeading eyebrow="Quem já veste" titulo="Depoimentos" tone="light" />

        <ul className="mt-16 grid gap-6 md:grid-cols-3">
          {depoimentos.map((depoimento, i) => (
            <Reveal
              as="li"
              key={depoimento.id}
              delay={i * 0.08}
              className="flex h-full flex-col rounded-sm border border-hairline-light p-8"
            >
              {depoimento.texto ? (
                <>
                  <blockquote className="flex-1">
                    <p className="font-display-mid text-[1.5rem] leading-snug text-ink">
                      “{depoimento.texto}”
                    </p>
                  </blockquote>
                  <footer className="mt-8 border-t border-hairline-light pt-5">
                    <p className="font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-ink">
                      {depoimento.autor}
                    </p>
                    {depoimento.cargo && (
                      <p className="mt-1 font-sans text-label uppercase text-muted-on-light">
                        {depoimento.cargo}
                      </p>
                    )}
                  </footer>
                </>
              ) : (
                <div className="flex flex-1 flex-col justify-between gap-8">
                  <span aria-hidden="true" className="font-display text-[3rem] leading-none text-gold/30">
                    “
                  </span>
                  <div>
                    <p className="font-sans text-label font-semibold uppercase text-gold">
                      TODO: depoimento real
                    </p>
                    <p className="mt-3 max-w-[30ch] text-body-sm text-muted-on-light">
                      Slot reservado. Preencher em <code className="font-sans">data/depoimentos.ts</code> com
                      um depoimento autorizado de escola, empresa ou marca atendida.
                    </p>
                  </div>
                </div>
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
