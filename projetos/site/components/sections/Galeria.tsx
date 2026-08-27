'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { PhotoPlaceholder, Foto } from '@/components/ui/PhotoPlaceholder';
import { galeria } from '@/data/galeria';

export function Galeria() {
  const [aberto, setAberto] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const gatilhoRef = useRef<HTMLButtonElement | null>(null);

  const fechar = useCallback(() => {
    setAberto(null);
    gatilhoRef.current?.focus();
  }, []);

  const navegar = useCallback((passo: number) => {
    setAberto((atual) => {
      if (atual === null) return atual;
      return (atual + passo + galeria.length) % galeria.length;
    });
  }, []);

  // Navegacao por teclado no lightbox: Esc fecha, setas percorrem.
  useEffect(() => {
    if (aberto === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowRight') navegar(1);
      if (e.key === 'ArrowLeft') navegar(-1);
      if (e.key === 'Tab') {
        // Foco preso dentro do dialogo.
        const focaveis = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focaveis || focaveis.length === 0) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [aberto, fechar, navegar]);

  const item = aberto !== null ? galeria[aberto] : null;

  return (
    <section id="galeria" className="fabric section-y bg-navy">
      <div className="container-am">
        <SectionHeading
          eyebrow="Produção"
          titulo="Peças e chão de fábrica"
          intro="As fotos reais da confecção entram aqui. Cada bloco abaixo já está no formato final — trocar a imagem não mexe em nenhum componente."
        />

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galeria.map((foto, i) => (
            <Reveal as="li" key={foto.id} delay={(i % 3) * 0.06}>
              <button
                type="button"
                onClick={(e) => {
                  gatilhoRef.current = e.currentTarget;
                  setAberto(i);
                }}
                className="group block w-full rounded-sm text-left transition-opacity duration-500 ease-seam hover:opacity-90"
                aria-label={`Ampliar: ${foto.descricao}`}
              >
                {foto.src ? (
                  <Foto src={foto.src} alt={foto.descricao} proporcao={foto.proporcao} />
                ) : (
                  <PhotoPlaceholder descricao={foto.descricao} proporcao={foto.proporcao} />
                )}
              </button>
            </Reveal>
          ))}
        </ul>
      </div>

      {item && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-deep/95 p-5 backdrop-blur-sm"
          onClick={fechar}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={item.descricao}
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {item.src ? (
              <Foto src={item.src} alt={item.descricao} proporcao={item.proporcao} sizes="90vw" />
            ) : (
              <PhotoPlaceholder descricao={item.descricao} proporcao={item.proporcao} />
            )}

            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navegar(-1)}
                className="rounded-sm border border-cream/25 px-4 py-2 font-sans text-label font-semibold uppercase text-cream transition-colors hover:border-gold hover:text-gold"
              >
                ← Anterior
              </button>
              <p className="font-sans text-label uppercase text-muted-on-dark">
                {item.descricao}
              </p>
              <button
                type="button"
                onClick={() => navegar(1)}
                className="rounded-sm border border-cream/25 px-4 py-2 font-sans text-label font-semibold uppercase text-cream transition-colors hover:border-gold hover:text-gold"
              >
                Próxima →
              </button>
            </div>

            <button
              type="button"
              onClick={fechar}
              className="absolute -top-12 right-0 rounded-sm border border-cream/25 px-4 py-2 font-sans text-label font-semibold uppercase text-cream transition-colors hover:border-gold hover:text-gold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
