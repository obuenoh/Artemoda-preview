import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { Hero } from '@/components/sections/Hero';
import { ProofBar } from '@/components/sections/ProofBar';
import { Solucoes } from '@/components/sections/Solucoes';
import { Processo } from '@/components/sections/Processo';
import { Diferenciais } from '@/components/sections/Diferenciais';
import { EscolarDestaque } from '@/components/sections/EscolarDestaque';
import { Depoimentos } from '@/components/sections/Depoimentos';
import { Galeria } from '@/components/sections/Galeria';
import { Faq } from '@/components/sections/Faq';
import { CtaForm } from '@/components/sections/CtaForm';
import { JsonLd, metadados, schemaFaq } from '@/lib/seo';
import { faq } from '@/data/faq';
import { mensagensWhatsapp } from '@/data/empresa';

export const metadata = metadados({
  titulo: 'Arte e Moda — Confecção de uniformes e private label em São Paulo',
  descricao:
    'Fábrica de uniformes em São Paulo: uniforme escolar personalizado, uniforme empresarial e private label. Corte e costura próprios, com bordado, silk e DTF. Peça um orçamento.',
  caminho: '/',
});

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <ProofBar />
        <Solucoes />
        <Processo />
        <Diferenciais />
        <EscolarDestaque />
        <Depoimentos />
        <Galeria />
        <Faq />
        <CtaForm origem="home" />
      </main>
      <Footer />
      <WhatsAppFloat mensagem={mensagensWhatsapp.home} origem="home" />
      <JsonLd data={schemaFaq(faq)} />
    </>
  );
}
