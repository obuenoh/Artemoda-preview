import { Eyebrow } from '@/components/ui/Eyebrow';
import { QuoteForm } from '@/components/form/QuoteForm';
import { empresa } from '@/data/empresa';

export function CtaForm({
  origem = 'home',
  eyebrow = 'Orçamento',
}: {
  origem?: string;
  eyebrow?: string;
}) {
  return (
    <section id="orcamento" className="section-y bg-cream text-ink">
      <div className="container-am">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow tone="gold">{eyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-display-l text-ink">
              {empresa.assinaturas.secundaria}
            </h2>
            <p className="mt-6 max-w-[42ch] text-body text-muted-on-light">
              Conta o que você precisa produzir. A gente volta com opções de tecido, prazo real e
              preço fechado — sem tabela genérica, porque cada pedido tem modelagem e grade
              próprias.
            </p>

            <dl className="mt-10 space-y-5 border-t border-hairline-light pt-8">
              <div>
                <dt className="font-sans text-label font-semibold uppercase text-gold">
                  Pedido mínimo
                </dt>
                <dd className="mt-1 text-body-sm text-muted-on-light">
                  A partir de {empresa.producao.pedidoMinimo} peças
                </dd>
              </div>
              <div>
                <dt className="font-sans text-label font-semibold uppercase text-gold">
                  Onde produzimos
                </dt>
                <dd className="mt-1 text-body-sm text-muted-on-light">
                  {empresa.endereco.bairro}, {empresa.endereco.cidade} — entrega para todo o Brasil
                </dd>
              </div>
              <div>
                <dt className="font-sans text-label font-semibold uppercase text-gold">
                  Atendimento
                </dt>
                <dd className="mt-1 text-body-sm text-muted-on-light">{empresa.horario.resumo}</dd>
              </div>
            </dl>
          </div>

          <QuoteForm origem={origem} />
        </div>
      </div>
    </section>
  );
}
