import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { SeamStitch } from '@/components/ui/Stitch';
import { PhotoPlaceholder } from '@/components/ui/PhotoPlaceholder';
import { Diferenciais } from '@/components/sections/Diferenciais';
import { CtaForm } from '@/components/sections/CtaForm';
import { metadados } from '@/lib/seo';
import { empresa, mensagensWhatsapp } from '@/data/empresa';
import { solucoes } from '@/data/solucoes';

export const metadata = metadados({
  titulo: 'Sobre a Arte e Moda — confecção própria na Penha, São Paulo',
  descricao:
    'Confecção de uniformes e private label na Penha de França, São Paulo. Compramos tecido direto da fábrica e fazemos corte e costura na nossa própria confecção.',
  caminho: '/sobre',
});

export default function SobrePage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <section className="fabric fabric-vignette bg-navy pt-[72px]">
          <div className="container-am py-20 md:py-28">
            <Eyebrow>A empresa</Eyebrow>
            <h1 className="mt-6 max-w-[12em] font-display text-display-xl text-cream">
              Uma confecção de verdade, não um intermediário com catálogo.
            </h1>
            <p className="mt-8 max-w-measure text-body text-muted-on-dark">
              A Arte e Moda compra tecido direto da fábrica e faz o corte e a costura na própria
              confecção, na Penha de França, em São Paulo. Quando você fala com a gente, fala com
              quem opera a máquina — não com quem vai repassar o seu pedido para outra pessoa.
            </p>
            <div className="mt-14">
              <SeamStitch />
            </div>
          </div>
        </section>

        <section className="section-y bg-cream text-ink">
          <div className="container-am">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
              <div>
                <SectionHeading
                  eyebrow="O que fazemos"
                  titulo="Três frentes, uma fábrica"
                  tone="light"
                  intro="A mesma equipe e as mesmas máquinas atendem escola, empresa e marca. O que muda é o briefing e a grade — o padrão de acabamento é um só."
                />

                <ul className="mt-12 space-y-8">
                  {solucoes.map((solucao) => (
                    <Reveal
                      as="li"
                      key={solucao.slug}
                      className="border-t border-hairline-light pt-6"
                    >
                      <h3 className="font-sans text-card-title font-semibold uppercase tracking-[0.08em] text-ink">
                        {solucao.frente}
                      </h3>
                      <p className="mt-3 max-w-[46ch] text-body-sm text-muted-on-light">
                        {solucao.descricao}
                      </p>
                    </Reveal>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:sticky lg:top-28 lg:self-start">
                <PhotoPlaceholder
                  descricao="Chão de fábrica — visão geral"
                  proporcao="4:5"
                  tone="light"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <PhotoPlaceholder
                  descricao="Mesa de corte"
                  proporcao="4:5"
                  tone="light"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <PhotoPlaceholder
                  descricao="Equipe costurando"
                  proporcao="4:5"
                  tone="light"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <PhotoPlaceholder
                  descricao="Acabamento e conferência"
                  proporcao="4:5"
                  tone="light"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bloco de historia: sem dados reais, nada e inventado. */}
        <section className="fabric section-y-sm bg-navy-deep">
          <div className="container-am">
            <div className="rounded-sm border border-dashed border-gold/50 p-8 md:p-12">
              <p className="font-sans text-label font-semibold uppercase text-gold">
                TODO: história da empresa
              </p>
              <p className="mt-4 max-w-measure text-body-sm text-muted-on-dark">
                Este bloco está reservado para a história real da Arte e Moda: quando a confecção
                começou, quem fundou, como o negócio passou de uniforme para private label, quantas
                pessoas trabalham hoje. Nada disso foi escrito ainda porque nenhuma dessas
                informações foi confirmada — e número inventado em página institucional é o tipo de
                coisa que um cliente checa. Preencher em{' '}
                <code className="font-sans text-cream">app/sobre/page.tsx</code>.
              </p>
            </div>
          </div>
        </section>

        <Diferenciais />

        <section className="section-y-sm bg-cream text-ink">
          <div className="container-am">
            <p className="mx-auto max-w-[30ch] text-center font-display text-display-l text-ink">
              {empresa.assinaturas.principal}
            </p>
          </div>
        </section>

        <CtaForm origem="sobre" />
      </main>
      <Footer />
      <WhatsAppFloat mensagem={mensagensWhatsapp.sobre} origem="sobre" />
    </>
  );
}
