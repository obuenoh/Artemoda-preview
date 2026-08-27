import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { StitchRail } from '@/components/ui/Stitch';
import { processo } from '@/data/processo';

const selos = {
  interno: 'Feito aqui dentro',
  parceiros: 'Parceiros especializados',
} as const;

/**
 * Bloco claro — respiro. A numeracao 01-06 aqui nao e enfeite: e sequencia
 * real de producao, e e o unico lugar da pagina onde Cormorant 300 aparece
 * grande sem competir com a headline do hero.
 */
export function Processo() {
  return (
    <section id="processo" className="section-y bg-cream text-ink">
      <div className="container-am">
        <SectionHeading
          eyebrow="Do briefing à entrega"
          titulo="Como produzimos"
          tone="light"
          intro="Corte e costura são internos. A personalização é feita com parceiros especializados, escolhidos conforme o tecido e a arte de cada peça."
        />

        <ol className="relative mt-16 grid gap-px md:grid-cols-2 lg:grid-cols-3">
          {processo.map((etapa, i) => (
            <Reveal
              as="li"
              key={etapa.numero}
              delay={i * 0.06}
              className="relative flex gap-6 border-t border-dashed border-gold/45 py-8 pr-6 md:py-10"
            >
              {/* Pesponto vertical ligando as etapas. */}
              <div className="relative flex shrink-0 flex-col items-center">
                <span className="font-display text-numeral leading-none text-gold/40">
                  {etapa.numero}
                </span>
                {i < processo.length - 1 && (
                  <StitchRail className="mt-3 flex-1 md:hidden" />
                )}
              </div>

              <div className="pt-2">
                <h3 className="font-sans text-card-title font-semibold uppercase tracking-[0.08em] text-ink">
                  {etapa.titulo}
                </h3>
                <p className="mt-3 max-w-[34ch] text-body-sm text-muted-on-light">
                  {etapa.descricao}
                </p>
                {etapa.selo && (
                  <p className="mt-5 inline-block rounded-sm border border-gold px-3 py-1.5 font-sans text-label font-semibold uppercase text-gold">
                    {selos[etapa.selo]}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
