import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { ViewContent } from '@/components/layout/Analytics';
import { LandingHero } from '@/components/sections/LandingHero';
import { Beneficios } from '@/components/sections/Beneficios';
import { Processo } from '@/components/sections/Processo';
import { Galeria } from '@/components/sections/Galeria';
import { CtaForm } from '@/components/sections/CtaForm';
import { metadados, JsonLd, schemaFaq } from '@/lib/seo';
import { mensagensWhatsapp } from '@/data/empresa';

export const metadata = metadados({
  titulo: 'Private label de roupa — confeccionista para a sua marca em São Paulo',
  descricao:
    'Private label e streetwear com confecção própria em São Paulo. Do piloto à grade completa, com modelagem, corte, costura e etiqueta da sua marca. Peça um orçamento.',
  caminho: '/private-label',
});

const beneficios = [
  {
    titulo: 'Do piloto à grade, no mesmo lugar',
    texto:
      'A gente desenvolve a peça piloto, ajusta o que não caiu bem e só depois roda a grade. Sem descobrir o problema com a coleção inteira pronta.',
  },
  {
    titulo: 'Sua etiqueta, sua marca',
    texto:
      'A peça sai com a sua identidade — etiqueta, tag e acabamento interno. Ninguém precisa saber quem costurou.',
  },
  {
    titulo: 'Modelagem que respeita a referência',
    texto:
      'Traga a peça que você quer replicar ou o desenho. Modelamos a partir do que você tem, e mostramos onde o tecido escolhido vai mudar o caimento.',
  },
  {
    titulo: 'Gramatura de streetwear de verdade',
    texto:
      'Moletom e camiseta oversized só funcionam com a gramatura certa. Compramos tecido direto da fábrica e escolhemos junto com você.',
  },
  {
    titulo: 'DTF, silk e bordado com parceiros especializados',
    texto:
      'Cada técnica com quem faz bem feito. Indicamos o que a sua arte pede em vez de forçar tudo no mesmo processo.',
  },
  {
    titulo: 'Começar pequeno é permitido',
    texto:
      'A partir de 30 peças. Marca nova não precisa apostar o caixa inteiro na primeira produção para ser levada a sério.',
  },
];

const faqPrivateLabel = [
  {
    pergunta: 'Preciso ter a modelagem pronta?',
    resposta:
      'Não. Você pode trazer uma peça de referência ou um desenho, e a gente faz a modelagem a partir disso.',
  },
  {
    pergunta: 'Qual a quantidade mínima para produzir a minha marca?',
    resposta:
      'A partir de 30 peças. Abaixo disso o custo de modelagem e preparação de máquina inviabiliza o preço da peça.',
  },
  {
    pergunta: 'A peça sai com a minha etiqueta?',
    resposta:
      'Sim. A produção é private label: a peça sai com a etiqueta, a tag e o acabamento interno da sua marca.',
  },
];

export default function PrivateLabelPage() {
  return (
    <>
      <ViewContent nome="private-label" />
      <Header />
      <main id="conteudo">
        <LandingHero
          eyebrow="Arte e Moda Studio"
          titulo="A sua marca, costurada na nossa confecção."
          subtitulo="Private label e streetwear para quem quer produzir a própria linha. Modelagem, corte, costura e acabamento aqui dentro — sua etiqueta na peça."
          prova={['Do piloto à grade', 'A partir de 30 peças', 'Sua etiqueta']}
          tipoInicial="Private label"
          origem="private-label"
          mensagemWhatsapp={mensagensWhatsapp.privateLabel}
        />
        <Beneficios
          eyebrow="Para marcas"
          titulo="Como o Studio trabalha"
          itens={beneficios}
        />
        <Processo />
        <Galeria />
        <CtaForm origem="private-label" eyebrow="Orçamento para marcas" />
      </main>
      <Footer />
      <WhatsAppFloat mensagem={mensagensWhatsapp.privateLabel} origem="private-label" />
      <JsonLd data={schemaFaq(faqPrivateLabel)} />
    </>
  );
}
