import type { Metadata, Viewport } from 'next';
import { Montserrat, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Analytics, GtmNoScript } from '@/components/layout/Analytics';
import { MotionProvider } from '@/components/layout/MotionProvider';
import { JsonLd, schemaNegocio } from '@/lib/seo';
import { empresa } from '@/data/empresa';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  weight: ['300', '400'],
});

export const metadata: Metadata = {
  metadataBase: new URL(empresa.site.url),
  title: {
    default: 'Arte e Moda — Confecção de uniformes e private label em São Paulo',
    template: '%s | Arte e Moda',
  },
  description:
    'Confecção própria de uniforme escolar, uniforme empresarial e private label em São Paulo. Corte e costura na nossa fábrica, com DTF, silk e bordado. Peça um orçamento.',
  applicationName: empresa.nome,
  authors: [{ name: empresa.nome }],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#15263D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body>
        <GtmNoScript />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:border focus:border-gold focus:bg-navy-deep focus:px-4 focus:py-3 focus:font-sans focus:text-label focus:font-semibold focus:uppercase focus:text-gold"
        >
          Pular para o conteúdo
        </a>
        {/* Sem JS as revelacoes de scroll nunca rodam: o conteudo
            nasceria invisivel. Este bloco garante a pagina legivel. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
        <JsonLd data={schemaNegocio()} />
        <Analytics />
      </body>
    </html>
  );
}
