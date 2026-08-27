import type { Metadata, Viewport } from 'next';
import { Montserrat, Cormorant_Garamond, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const ui = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fonte-ui',
  weight: ['400', '500', '600', '700'],
});
const display = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fonte-display',
  weight: ['300', '400'],
});
// Mono aparece so onde existe codigo de maquina: nº de ordem, SKU, codigo
// de barras. Nunca em texto corrido.
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fonte-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: { default: 'Gerenciador Arte e Moda', template: '%s · Arte e Moda' },
  description: 'Sistema de gestão da confecção Arte e Moda.',
};

export const viewport: Viewport = { themeColor: '#15263D', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${ui.variable} ${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
