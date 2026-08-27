import { QuoteForm } from '@/components/form/QuoteForm';
import { CareLabel } from '@/components/ui/CareLabel';
import { Button } from '@/components/ui/Button';
import { whatsappLink } from '@/data/empresa';
import type { TIPOS } from '@/lib/lead-schema';

/**
 * Hero das landings de anuncio. O formulario entra aqui dentro, ja no
 * passo 1 — no mobile o seletor fica acima da dobra e um toque avanca.
 * Quem chega de anuncio no Instagram nao deveria ter que rolar para
 * descobrir o que fazer.
 */
export function LandingHero({
  eyebrow,
  titulo,
  subtitulo,
  prova,
  tipoInicial,
  origem,
  mensagemWhatsapp,
}: {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  prova: string[];
  tipoInicial: (typeof TIPOS)[number];
  origem: string;
  mensagemWhatsapp: string;
}) {
  return (
    <section className="fabric fabric-vignette relative bg-navy pt-[72px]">
      <div className="container-am py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
          <div className="lg:pt-8">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="block h-px w-6 bg-gold" />
              <p className="font-sans text-eyebrow font-semibold uppercase text-gold">{eyebrow}</p>
            </div>

            <h1 className="mt-6 max-w-[11em] font-display text-display-xl text-cream">{titulo}</h1>

            <p className="mt-6 max-w-measure text-body text-muted-on-dark">{subtitulo}</p>

            <CareLabel className="mt-8" items={prova} />

            <div className="mt-8 lg:hidden">
              <Button href={whatsappLink(mensagemWhatsapp)} variant="outline-light" className="w-full">
                Prefiro falar no WhatsApp
              </Button>
            </div>
          </div>

          <QuoteForm origem={origem} tipoInicial={tipoInicial} />
        </div>

        <div className="mt-10 hidden lg:block">
          <Button href={whatsappLink(mensagemWhatsapp)} variant="outline-light">
            Prefiro falar no WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
