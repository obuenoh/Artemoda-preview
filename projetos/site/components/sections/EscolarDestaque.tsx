import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { StitchedPanel } from '@/components/ui/Stitch';
import { PhotoPlaceholder } from '@/components/ui/PhotoPlaceholder';
import { whatsappLink, mensagensWhatsapp } from '@/data/empresa';

const pontos = [
  {
    titulo: 'Kit completo',
    texto: 'Camiseta, agasalho, short, calça e o que mais a escola pedir — tudo saindo da mesma produção, com a mesma cor e o mesmo tecido do começo ao fim do ano.',
  },
  {
    titulo: 'Grade fechada',
    texto: 'Da infantil à adulta, com modelagem que serve criança pequena e adolescente sem precisar de dois fornecedores.',
  },
  {
    titulo: 'Reposição no meio do ano',
    texto: 'Aluno novo entrou em maio, uniforme rasgou em agosto? A modelagem e a ficha do tecido ficam guardadas — a reposição sai igual à primeira remessa.',
  },
  {
    titulo: 'Prazo de volta às aulas',
    texto: 'Planejamos a produção para a peça estar na mão da família antes do primeiro dia, não depois.',
  },
  {
    titulo: 'Atendimento à direção e à comissão de pais',
    texto: 'Apresentamos amostra, tabela de medidas e proposta no formato que o conselho precisa para aprovar.',
  },
];

/**
 * Bloco dedicado — escola e o publico mais lucrativo e o que mais volta.
 * Painel aplicado com pesponto no perimetro, igual bolso chapado.
 */
export function EscolarDestaque() {
  return (
    <section className="fabric bg-navy-deep">
      <div className="container-am section-y">
        <StitchedPanel className="px-6 py-10 md:px-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
            <div>
              <Eyebrow>Para escolas</Eyebrow>
              <h2 className="mt-5 font-display text-display-l text-cream">
                O uniforme da escola inteira, do primeiro dia à reposição de agosto.
              </h2>

              <ul className="mt-10 space-y-6">
                {pontos.map((ponto, i) => (
                  <Reveal as="li" key={ponto.titulo} delay={i * 0.05} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-[0.6rem] block h-px w-4 shrink-0 bg-gold"
                    />
                    <div>
                      <h3 className="font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-cream">
                        {ponto.titulo}
                      </h3>
                      <p className="mt-2 max-w-[46ch] text-body-sm text-muted-on-dark">
                        {ponto.texto}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ul>

              <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                <Button href="/uniformes-escolares">Ver uniforme escolar</Button>
                <Button href={whatsappLink(mensagensWhatsapp.escolares)} variant="outline-light">
                  Falar com a equipe
                </Button>
              </div>
            </div>

            <Reveal delay={0.1}>
              <PhotoPlaceholder
                descricao="Kit escolar completo"
                proporcao="4:5"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>
          </div>
        </StitchedPanel>
      </div>
    </section>
  );
}
