import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { AtelierIcon } from '@/components/icons/AtelierIcons';
import { diferenciais } from '@/data/diferenciais';

export function Diferenciais() {
  return (
    <section className="fabric section-y bg-navy">
      <div className="container-am">
        <SectionHeading eyebrow="O que nos separa" titulo="Por que a Arte e Moda" />

        <ul className="mt-16 grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {diferenciais.map((item, i) => (
            <Reveal as="li" key={item.titulo} delay={(i % 3) * 0.08}>
              <AtelierIcon name={item.icone} className="h-7 w-7 text-gold" />
              <h3 className="mt-6 font-sans text-card-title font-semibold uppercase tracking-[0.08em] text-cream">
                {item.titulo}
              </h3>
              <span aria-hidden="true" className="mt-4 block h-px w-6 bg-gold" />
              <p className="mt-5 max-w-[34ch] text-body-sm text-muted-on-dark">
                {item.descricao}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
