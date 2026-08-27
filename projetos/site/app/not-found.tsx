import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo" className="fabric flex min-h-[70svh] items-center bg-navy pt-[72px]">
        <div className="container-am py-20">
          <Eyebrow>Erro 404</Eyebrow>
          <h1 className="mt-6 max-w-[16ch] font-display text-display-l text-cream">
            Essa página não existe — mas a produção continua.
          </h1>
          <p className="mt-6 max-w-measure text-body text-muted-on-dark">
            O link que você seguiu não leva a lugar nenhum. Volta para a home ou pede o orçamento
            direto.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/contato">Solicitar orçamento</Button>
            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center font-sans text-label font-semibold uppercase text-muted-on-dark transition-colors hover:text-gold"
            >
              ← Voltar para a home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
