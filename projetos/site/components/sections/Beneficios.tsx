import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function Beneficios({
  eyebrow,
  titulo,
  intro,
  itens,
  tone = 'dark',
}: {
  eyebrow?: string;
  titulo: string;
  intro?: string;
  itens: { titulo: string; texto: string }[];
  tone?: 'dark' | 'light';
}) {
  const isDark = tone === 'dark';
  return (
    <section className={`section-y ${isDark ? 'fabric bg-navy' : 'bg-cream text-ink'}`}>
      <div className="container-am">
        <SectionHeading eyebrow={eyebrow} titulo={titulo} intro={intro} tone={tone} />

        <ul className="mt-16 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {itens.map((item, i) => (
            <Reveal
              as="li"
              key={item.titulo}
              delay={(i % 2) * 0.08}
              className={`border-t pt-8 ${isDark ? 'border-hairline' : 'border-hairline-light'}`}
            >
              <h3
                className={`font-sans text-card-title font-semibold uppercase tracking-[0.08em] ${
                  isDark ? 'text-cream' : 'text-ink'
                }`}
              >
                {item.titulo}
              </h3>
              <p
                className={`mt-4 max-w-[46ch] text-body-sm ${
                  isDark ? 'text-muted-on-dark' : 'text-muted-on-light'
                }`}
              >
                {item.texto}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
