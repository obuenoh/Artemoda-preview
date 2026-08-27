import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { ViewContent } from '@/components/layout/Analytics';
import { LandingHero } from '@/components/sections/LandingHero';
import { Beneficios } from '@/components/sections/Beneficios';
import { Processo } from '@/components/sections/Processo';
import { ProofBar } from '@/components/sections/ProofBar';
import { CtaForm } from '@/components/sections/CtaForm';
import { metadados, JsonLd, schemaFaq } from '@/lib/seo';
import { mensagensWhatsapp } from '@/data/empresa';

export const metadata = metadados({
  titulo: 'Uniforme escolar personalizado — fábrica própria em São Paulo',
  descricao:
    'Kit completo de uniforme escolar personalizado com fabricação própria em São Paulo. Grade fechada, reposição durante o ano letivo e entrega antes da volta às aulas. Peça um orçamento.',
  caminho: '/uniformes-escolares',
});

const beneficios = [
  {
    titulo: 'O kit inteiro na mesma produção',
    texto:
      'Camiseta, agasalho, short, calça — tudo saindo do mesmo tecido e do mesmo lote de cor. Nada de o azul do agasalho não bater com o azul da camiseta porque vieram de fornecedores diferentes.',
  },
  {
    titulo: 'Grade que serve do infantil ao adulto',
    texto:
      'Modelagem própria pensada para o corpo de criança pequena e de adolescente. A escola não precisa de dois fornecedores para fechar a grade.',
  },
  {
    titulo: 'Reposição igual à primeira remessa',
    texto:
      'Guardamos a modelagem e a ficha de tecido de cada escola. Aluno novo em maio ou peça rasgada em agosto: a reposição sai idêntica, sem remontar o pedido do zero.',
  },
  {
    titulo: 'Produção planejada para a volta às aulas',
    texto:
      'Trabalhamos de trás para frente a partir do primeiro dia de aula, para a peça estar com a família antes — não depois.',
  },
  {
    titulo: 'Personalização que aguenta lavagem',
    texto:
      'Bordado, silk ou DTF escolhidos conforme o tecido e o uso. Uniforme escolar lava muito, e a aplicação precisa acompanhar o ano inteiro.',
  },
  {
    titulo: 'Material pronto para a direção aprovar',
    texto:
      'Amostra física, tabela de medidas e proposta no formato que a comissão de pais e a secretaria precisam para bater o martelo.',
  },
];

const faqEscolar = [
  {
    pergunta: 'Vocês atendem a comissão de pais junto com a direção?',
    resposta:
      'Sim. Apresentamos amostra e proposta para quem a escola indicar — direção, secretaria ou comissão de pais — e ajustamos o material conforme o processo de aprovação de cada instituição.',
  },
  {
    pergunta: 'Dá para repor peça durante o ano letivo?',
    resposta:
      'Sim, e é o mais comum. A modelagem e a ficha do tecido ficam guardadas com a gente, então a reposição sai igual à remessa original.',
  },
  {
    pergunta: 'Qual a quantidade mínima para uma escola?',
    resposta:
      'Trabalhamos a partir de 30 peças. Para escola, o volume costuma passar disso já no primeiro pedido.',
  },
];

export default function UniformesEscolaresPage() {
  return (
    <>
      <ViewContent nome="uniformes-escolares" />
      {/* Menu simplificado: quem vem de anúncio chega com uma intenção só. */}
      <Header simplificado />
      <main id="conteudo">
        <LandingHero
          eyebrow="Para escolas particulares"
          titulo="O uniforme da escola inteira, feito na nossa fábrica."
          subtitulo="Kit completo, grade fechada e reposição durante todo o ano letivo. Corte e costura são nossos — a escola trata com quem produz, não com atravessador."
          prova={['Fabricação própria', 'Grade 2–16', 'Reposição no ano letivo']}
          tipoInicial="Uniforme escolar"
          origem="landing-escolares"
          mensagemWhatsapp={mensagensWhatsapp.escolares}
        />
        <ProofBar />
        <Beneficios
          eyebrow="O que a escola ganha"
          titulo="Por que escolas ficam"
          itens={beneficios}
        />
        <Processo />
        <CtaForm origem="landing-escolares" eyebrow="Orçamento para escolas" />
      </main>
      <Footer />
      <WhatsAppFloat mensagem={mensagensWhatsapp.escolares} origem="landing-escolares" />
      <JsonLd data={schemaFaq(faqEscolar)} />
    </>
  );
}
