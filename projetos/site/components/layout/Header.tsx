'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

const nav = [
  { label: 'Soluções', href: '/#solucoes' },
  { label: 'Processo', href: '/#processo' },
  { label: 'Escolas', href: '/uniformes-escolares/' },
  { label: 'Empresas', href: '/uniformes-empresariais/' },
  { label: 'Private label', href: '/private-label/' },
  { label: 'Sobre', href: '/sobre/' },
];

/**
 * `simplificado` e o modo das landings de anuncio: sem menu que distraia,
 * so marca e a acao. O trafego pago chega com uma intencao so.
 */
export function Header({ simplificado = false }: { simplificado?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  const isHome =
    !pathname ||
    pathname === '/' ||
    pathname === '/Artemoda-preview/site' ||
    pathname === '/Artemoda-preview/site/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  function handleNavClick(e: React.MouseEvent, href: string) {
    if (href.includes('#')) {
      const hash = href.split('#')[1];
      if (isHome) {
        e.preventDefault();
        const target = document.getElementById(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${hash}`);
        }
        setAberto(false);
        return;
      }
    }
    setAberto(false);
  }

  function rolarParaOrcamento(e: React.MouseEvent) {
    if (isHome) {
      e.preventDefault();
      const orcamento = document.getElementById('orcamento');
      if (orcamento) {
        orcamento.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '#orcamento');
      }
      setAberto(false);
    } else {
      setAberto(false);
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-seam ${
        scrolled ? 'bg-navy-deep/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div
        className={`h-px w-full transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'var(--hairline)' }}
      />
      <div className="container-am flex h-[72px] items-center justify-between">
        <Logo size="sm" />

        {!simplificado && (
          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-on-dark transition-colors duration-300 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-3">
          <Button
            href={isHome ? '#orcamento' : '/#orcamento'}
            onClick={rolarParaOrcamento}
            variant="primary"
            className="hidden sm:inline-flex"
          >
            Solicitar orçamento
          </Button>

          {!simplificado && (
            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-mobile"
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-cream/25 text-cream transition-colors hover:border-gold hover:text-gold lg:hidden"
            >
              <span className="sr-only">{aberto ? 'Fechar menu' : 'Abrir menu'}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                {aberto ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {!simplificado && aberto && (
        <div
          id="menu-mobile"
          className="fabric border-t border-hairline bg-navy-deep lg:hidden"
        >
          <nav aria-label="Navegação principal (mobile)" className="container-am py-8">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="block border-b border-hairline py-4 font-sans text-[0.75rem] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button
              href={isHome ? '#orcamento' : '/#orcamento'}
              onClick={rolarParaOrcamento}
              variant="primary"
              className="mt-8 w-full"
            >
              Solicitar orçamento
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
