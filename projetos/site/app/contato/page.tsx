import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { QuoteForm } from '@/components/form/QuoteForm';
import { SeamStitch } from '@/components/ui/Stitch';
import { metadados } from '@/lib/seo';
import { empresa, mensagensWhatsapp } from '@/data/empresa';

export const metadata = metadados({
  titulo: 'Contato e orçamento — Arte e Moda, confecção em São Paulo',
  descricao:
    'Fale com a Arte e Moda: WhatsApp (11) 94747-3375, e-mail e endereço da confecção na Penha de França, São Paulo. Peça seu orçamento de uniforme ou private label.',
  caminho: '/contato',
});

const mapa = `https://www.google.com/maps?q=${encodeURIComponent(
  `${empresa.endereco.logradouro}, ${empresa.endereco.bairro}, ${empresa.endereco.cidade} - ${empresa.endereco.uf}`,
)}&output=embed`;

export default function ContatoPage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <section className="fabric fabric-vignette bg-navy pt-[72px]">
          <div className="container-am py-16 md:py-24">
            <Eyebrow>Contato</Eyebrow>
            <h1 className="mt-6 max-w-[11em] font-display text-display-xl text-cream">
              Conta o que você precisa produzir.
            </h1>
            <p className="mt-6 max-w-measure text-body text-muted-on-dark">
              Respondemos com opções de tecido, prazo real e preço fechado. Se preferir resolver
              agora, o WhatsApp está logo ali embaixo.
            </p>

            <div className="mt-16 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div>
                <dl className="space-y-8">
                  <div>
                    <dt className="font-sans text-label font-semibold uppercase text-gold">
                      WhatsApp
                    </dt>
                    <dd className="mt-2">
                      <a
                        href={`https://wa.me/${empresa.contato.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display-mid text-[1.5rem] text-cream transition-colors hover:text-gold"
                      >
                        {empresa.contato.whatsappFormatado}
                      </a>
                    </dd>
                  </div>

                  <div>
                    <dt className="font-sans text-label font-semibold uppercase text-gold">
                      E-mail
                    </dt>
                    <dd className="mt-2">
                      <a
                        href={`mailto:${empresa.contato.email}`}
                        className="break-all text-body text-muted-on-dark transition-colors hover:text-gold"
                      >
                        {empresa.contato.email}
                      </a>
                    </dd>
                  </div>

                  <div>
                    <dt className="font-sans text-label font-semibold uppercase text-gold">
                      Instagram
                    </dt>
                    <dd className="mt-2">
                      <a
                        href={empresa.contato.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-muted-on-dark transition-colors hover:text-gold"
                      >
                        @{empresa.contato.instagram}
                      </a>
                    </dd>
                  </div>

                  <div>
                    <dt className="font-sans text-label font-semibold uppercase text-gold">
                      Confecção
                    </dt>
                    <dd className="mt-2">
                      <address className="not-italic text-body text-muted-on-dark">
                        {empresa.endereco.logradouro}
                        <br />
                        {empresa.endereco.bairro} — {empresa.endereco.cidade}/{empresa.endereco.uf}
                      </address>
                    </dd>
                  </div>

                  <div>
                    <dt className="font-sans text-label font-semibold uppercase text-gold">
                      Atendimento
                    </dt>
                    <dd className="mt-2 text-body text-muted-on-dark">{empresa.horario.resumo}</dd>
                  </div>

                  <div>
                    <dt className="font-sans text-label font-semibold uppercase text-gold">CNPJ</dt>
                    <dd className="mt-2 text-body text-muted-on-dark">{empresa.cnpj}</dd>
                  </div>
                </dl>

                <div className="mt-10">
                  <SeamStitch />
                </div>

                <div className="mt-10 overflow-hidden rounded-sm border border-hairline">
                  <iframe
                    src={mapa}
                    title={`Mapa — ${empresa.endereco.completo}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-[280px] w-full grayscale-[0.4]"
                  />
                </div>
              </div>

              <QuoteForm origem="contato" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat mensagem={mensagensWhatsapp.contato} origem="contato" />
    </>
  );
}
