import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CareLabel } from '@/components/ui/CareLabel';
import { Reveal } from '@/components/ui/Reveal';
import { AtelierIcon } from '@/components/icons/AtelierIcons';
import { solucoes } from '@/data/solucoes';

/**
 * Cards sem preenchimento — so borda hairline. No hover a borda vira
 * pesponto tracejado, como se a peca fosse arrematada.
 */
export function Solucoes() {
  return (
    <section id="solucoes" className="fabric section-y bg-navy">
      <div className="container-am">
        <SectionHeading
          eyebrow="Nossas frentes"
          titulo="Nossas soluções"
          intro="Três frentes, uma confecção. A mesma máquina que fecha o kit de uma escola fecha a coleção de uma marca — muda o briefing, não o padrão."
        />

        <ul className="mt-16 grid gap-6 md:grid-cols-3">
          {solucoes.map((solucao, i) => (
            <Reveal as="li" key={solucao.slug} delay={i * 0.08}>
              <Link
                href={solucao.href}
                className="group flex h-full flex-col rounded-sm border border-hairline p-8 transition-colors duration-500 ease-seam hover:border-gold hover:[border-style:dashed]"
              >
                <AtelierIcon
                  name={solucao.icone}
                  className="h-7 w-7 text-gold transition-transform duration-500 ease-seam group-hover:-translate-y-0.5"
                />

                <p className="mt-8 font-sans text-label font-medium uppercase text-muted-on-dark">
                  {solucao.frente}
                </p>
                <h3 className="mt-2 font-sans text-card-title font-semibold uppercase tracking-[0.08em] text-cream">
                  {solucao.titulo}
                </h3>

                <span
                  aria-hidden="true"
                  className="mt-4 block h-px w-6 bg-gold transition-all duration-500 ease-seam group-hover:w-14"
                />

                <p className="mt-5 flex-1 text-body-sm text-muted-on-dark">{solucao.descricao}</p>

                <span className="mt-8 inline-flex items-center gap-2 font-sans text-label font-semibold uppercase text-gold">
                  Ver
                  <span aria-hidden="true" className="transition-transform duration-500 ease-seam group-hover:translate-x-1">
                    →
                  </span>
                </span>

                <CareLabel className="mt-6 border-t border-hairline pt-4" items={solucao.etiqueta} />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
