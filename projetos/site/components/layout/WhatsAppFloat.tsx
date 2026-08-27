'use client';

import { useEffect, useState } from 'react';
import { empresa, whatsappLink } from '@/data/empresa';
import { trackContact } from '@/lib/analytics';

/**
 * Botao flutuante presente em todas as paginas. A mensagem vem pronta e
 * muda por pagina — quem chega pela landing de escola nao deveria ter que
 * explicar de novo o que quer.
 */
export function WhatsAppFloat({
  mensagem,
  origem,
}: {
  mensagem: string;
  origem: string;
}) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Só aparece depois do hero, para não competir com o CTA principal.
    const onScroll = () => setVisivel(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={whatsappLink(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackContact({ canal: 'whatsapp', origem })}
      aria-label={`Falar no WhatsApp: ${empresa.contato.whatsappFormatado}`}
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-sm border border-gold bg-navy-deep px-4 py-3 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold shadow-none transition-all duration-500 ease-seam hover:bg-gold hover:text-ink md:bottom-8 md:right-8 ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24M8.53 7.33c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.35.99 2.51.12.17 1.69 2.58 4.1 3.61.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
