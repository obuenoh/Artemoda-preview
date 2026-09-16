'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { StitchedPanel } from '@/components/ui/Stitch';
import { whatsappLink, mensagensWhatsapp } from '@/data/empresa';
import { assetUrl } from '@/lib/assets';

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

const fotosEscola = [
  {
    id: 'phoenix',
    src: '/images/escola-phoenix.jpg',
    escola: 'Escola Phoenix',
    descricao: 'Polo piquet azul marinho, jaqueta com zíper dourado e calça com brasão bordado',
    badge: 'Kit Oficial Escola Phoenix',
  },
  {
    id: 'emilia',
    src: '/images/colegio-emilia.jpg',
    escola: 'Colégio Emília',
    descricao: 'Jaqueta collegiate verde floresta, polo com gola contrastante e bermuda tailored',
    badge: 'Kit Oficial Colégio Emília',
  },
  {
    id: 'grade',
    src: '/images/escolar-grade-oficina.jpg',
    escola: 'Grade Completa na Linha de Produção',
    descricao: 'Moletons flanelados, agasalhos e camisetas produzidos sob demanda contínua',
    badge: 'Confecção Própria em SP',
  },
];

/**
 * Bloco dedicado — escola e o publico mais lucrativo e o que mais volta.
 * Painel aplicado com pesponto no perimetro e carrossel de fotos reais.
 */
export function EscolarDestaque() {
  const [slideAtual, setSlideAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const mudarSlide = useCallback((direcao: number) => {
    setSlideAtual((prev) => (prev + direcao + fotosEscola.length) % fotosEscola.length);
  }, []);

  // Passagem automática das fotos a cada 4.5 segundos
  useEffect(() => {
    if (pausado) return;
    const timer = setInterval(() => {
      mudarSlide(1);
    }, 4500);
    return () => clearInterval(timer);
  }, [pausado, mudarSlide]);

  return (
    <section id="escolas" className="fabric bg-navy-deep">
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
                <Button href="/uniformes-escolares/">Ver uniforme escolar</Button>
                <Button href={whatsappLink(mensagensWhatsapp.escolares)} variant="outline-light">
                  Falar com a equipe
                </Button>
              </div>
            </div>

            {/* Carrossel de fotos reais passando */}
            <Reveal delay={0.1}>
              <div
                className="relative aspect-[3/4] w-full overflow-hidden rounded-sm border border-gold/40 bg-navy-raised shadow-2xl"
                onMouseEnter={() => setPausado(true)}
                onMouseLeave={() => setPausado(false)}
                aria-roledescription="carousel"
                aria-label="Fotos de uniformes escolares produzidos pela Arte e Moda"
              >
                {/* Slides com transição de opacidade suave */}
                {fotosEscola.map((foto, index) => {
                  const ativo = index === slideAtual;
                  return (
                    <div
                      key={foto.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        ativo
                          ? 'opacity-100 scale-100 pointer-events-auto'
                          : 'opacity-0 scale-105 pointer-events-none'
                      }`}
                      aria-hidden={!ativo}
                    >
                      <Image
                        src={assetUrl(foto.src)}
                        alt={`Uniforme escolar — ${foto.escola}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority={index === 0}
                        className="object-cover"
                      />
                      {/* Gradiente de proteção de contraste na base */}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent" />
                    </div>
                  );
                })}

                {/* Controles de navegação anterior / próxima */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => mudarSlide(-1)}
                    aria-label="Foto anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-sm border border-cream/30 bg-navy-deep/80 text-cream backdrop-blur-sm transition-all hover:border-gold hover:bg-gold hover:text-ink"
                  >
                    <span aria-hidden="true" className="text-sm">‹</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => mudarSlide(1)}
                    aria-label="Próxima foto"
                    className="flex h-9 w-9 items-center justify-center rounded-sm border border-cream/30 bg-navy-deep/80 text-cream backdrop-blur-sm transition-all hover:border-gold hover:bg-gold hover:text-ink"
                  >
                    <span aria-hidden="true" className="text-sm">›</span>
                  </button>
                </div>

                {/* Legenda elegante com o nome da escola e especificações */}
                <div className="absolute inset-x-4 bottom-4 z-10 rounded-sm border border-gold/30 bg-navy-deep/90 p-4.5 backdrop-blur-md transition-all duration-500">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block font-sans text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold">
                      {fotosEscola[slideAtual].badge}
                    </span>
                    <span className="font-sans text-[0.625rem] font-mono text-muted-on-dark">
                      0{slideAtual + 1} / 0{fotosEscola.length}
                    </span>
                  </div>
                  <h4 className="mt-1.5 font-display-mid text-[1.125rem] text-cream">
                    {fotosEscola[slideAtual].escola}
                  </h4>
                  <p className="mt-1 text-[0.75rem] text-muted-on-dark leading-snug">
                    {fotosEscola[slideAtual].descricao}
                  </p>

                  {/* Barras indicadoras com clique */}
                  <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-hairline">
                    {fotosEscola.map((f, i) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSlideAtual(i)}
                        aria-label={`Ver slide ${i + 1}: ${f.escola}`}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i === slideAtual ? 'w-8 bg-gold' : 'w-2 bg-cream/30 hover:bg-cream/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </StitchedPanel>
      </div>
    </section>
  );
}
