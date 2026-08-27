'use client';

import { useRef, useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faq } from '@/data/faq';

/**
 * Accordion com navegacao por teclado: setas percorrem as perguntas,
 * Home/End vao para a primeira e a ultima. Divisor em hairline dourado.
 */
export function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const total = faq.length;
    let alvo: number | null = null;

    if (e.key === 'ArrowDown') alvo = (i + 1) % total;
    if (e.key === 'ArrowUp') alvo = (i - 1 + total) % total;
    if (e.key === 'Home') alvo = 0;
    if (e.key === 'End') alvo = total - 1;

    if (alvo !== null) {
      e.preventDefault();
      botoes.current[alvo]?.focus();
    }
  }

  return (
    <section id="faq" className="fabric section-y bg-navy">
      <div className="container-am">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading
            eyebrow="Antes de pedir orçamento"
            titulo="Dúvidas frequentes"
            intro="Se a sua pergunta não estiver aqui, chama no WhatsApp — a gente responde sem enrolação comercial."
          />

          <div>
            {faq.map((item, i) => {
              const estaAberto = aberto === i;
              return (
                <div key={item.pergunta} className="border-b border-hairline first:border-t">
                  <h3>
                    <button
                      ref={(el) => {
                        botoes.current[i] = el;
                      }}
                      type="button"
                      onClick={() => setAberto(estaAberto ? null : i)}
                      onKeyDown={(e) => onKeyDown(e, i)}
                      aria-expanded={estaAberto}
                      aria-controls={`faq-painel-${i}`}
                      id={`faq-botao-${i}`}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-300 hover:text-gold"
                    >
                      <span className="font-sans text-[0.9375rem] font-medium tracking-[0.02em] text-cream">
                        {item.pergunta}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`relative mt-2 block h-3 w-3 shrink-0 transition-transform duration-500 ease-seam ${
                          estaAberto ? 'rotate-45' : ''
                        }`}
                      >
                        <span className="absolute left-0 top-1/2 h-px w-3 bg-gold" />
                        <span className="absolute left-1/2 top-0 h-3 w-px bg-gold" />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`faq-painel-${i}`}
                    role="region"
                    aria-labelledby={`faq-botao-${i}`}
                    hidden={!estaAberto}
                    className="pb-8 pr-10"
                  >
                    <p className="max-w-measure text-body-sm text-muted-on-dark">
                      {item.resposta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
