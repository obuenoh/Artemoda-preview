import { Button } from '@/components/ui/Button';
import { SeamStitch } from '@/components/ui/Stitch';
import { Reveal } from '@/components/ui/Reveal';
import { CareLabel } from '@/components/ui/CareLabel';
import { empresa, whatsappLink, mensagensWhatsapp } from '@/data/empresa';

/**
 * Hero sem foto — por escolha, nao por falta. Tipografia dentro de uma
 * moldura hairline dourada: capa de catalogo, hangtag em papel cartao.
 * O site precisa ficar bom com zero fotos; foto so vai melhorar.
 */
export function Hero() {
  return (
    <section className="fabric fabric-vignette relative bg-navy pt-[72px]">
      <div className="container-am">
        <div className="relative flex min-h-[calc(100svh-72px)] flex-col justify-center py-20 md:py-28">
          {/* Moldura hairline — a borda da etiqueta. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 inset-y-8 rounded-sm border border-hairline md:inset-y-12 md:-mx-6"
          />

          <div className="relative">
            <Reveal>
              <h1 className="max-w-[12em] font-display text-display-xl text-cream">
                Uniformes e confecção premium, feitos na nossa fábrica.
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 flex items-center gap-3">
                <span aria-hidden="true" className="block h-px w-6 bg-gold" />
                <p className="font-sans text-eyebrow font-semibold uppercase text-gold">
                  {empresa.descritor}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/contato">Solicitar orçamento</Button>
                <Button href={whatsappLink(mensagensWhatsapp.home)} variant="outline-light">
                  Falar no WhatsApp
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.26} className="relative mt-16 md:mt-24">
            <SeamStitch />
            <CareLabel
              className="mt-5"
              items={['Fabricação própria', 'Escolas e empresas', 'Entrega para todo o Brasil']}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
