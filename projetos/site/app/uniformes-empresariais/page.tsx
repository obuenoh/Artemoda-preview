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
  titulo: 'Uniforme empresarial personalizado — confecção própria em São Paulo',
  descricao:
    'Uniforme empresarial com fabricação própria em São Paulo: camisa, polo, jaleco e conjunto operacional com bordado e silk. Orçamento com prazo fechado e nota fiscal.',
  caminho: '/uniformes-empresariais',
});

const beneficios = [
  {
    titulo: 'A peça certa para cada função',
    texto:
      'Escritório, loja, cozinha e operação pedem tecido, caimento e gramatura diferentes. A gente monta o mix em vez de vestir a empresa inteira com a mesma camisa.',
  },
  {
    titulo: 'Bordado que não solta no primeiro mês',
    texto:
      'Para uniforme corporativo, bordado costuma ganhar do silk: aguenta lavagem industrial e mantém a marca legível. Indicamos a técnica peça a peça.',
  },
  {
    titulo: 'Grade e reposição controladas',
    texto:
      'Funcionário novo entra todo mês. A ficha do pedido fica guardada, então a segunda remessa sai igual à primeira — mesma cor, mesmo molde.',
  },
  {
    titulo: 'Documentação que o setor de compras precisa',
    texto:
      'Nota fiscal, dados cadastrais e proposta formal. RH e facilities conseguem aprovar internamente sem ter que caçar informação.',
  },
  {
    titulo: 'Fabricação própria, prazo real',
    texto:
      'O prazo que a gente combina é o da nossa produção, não a estimativa de um fornecedor que a gente também está esperando.',
  },
  {
    titulo: 'Amostra antes do volume',
    texto:
      'Você aprova a peça piloto — tecido, cor, aplicação e caimento — antes de a produção inteira rodar.',
  },
];

const faqEmpresarial = [
  {
    pergunta: 'Vocês emitem nota fiscal para empresa?',
    resposta:
      'Sim. Atendemos empresa com nota fiscal e com a documentação que o setor de compras precisar para cadastrar o fornecedor.',
  },
  {
    pergunta: 'Dá para fazer uma peça piloto antes do pedido todo?',
    resposta:
      'Sim, e recomendamos. Você aprova tecido, cor, caimento e aplicação na peça piloto antes de a produção inteira rodar.',
  },
  {
    pergunta: 'Qual a quantidade mínima para uniforme empresarial?',
    resposta:
      'A partir de 30 peças. Dependendo do modelo dá para conversar — fale com a gente antes de descartar.',
  },
];

export default function UniformesEmpresariaisPage() {
  return (
    <>
      <ViewContent nome="uniformes-empresariais" />
      <Header />
      <main id="conteudo">
        <LandingHero
          eyebrow="Para empresas"
          titulo="Uniforme corporativo com a costura feita aqui dentro."
          subtitulo="Camisa, polo, jaleco e conjunto operacional com bordado ou silk. Prazo fechado, nota fiscal e reposição para quem entra depois."
          prova={['Fabricação própria', 'Bordado e silk', 'Nota fiscal']}
          tipoInicial="Uniforme empresarial"
          origem="landing-empresariais"
          mensagemWhatsapp={mensagensWhatsapp.empresariais}
        />
        <ProofBar />
        <Beneficios
          eyebrow="O que o RH ganha"
          titulo="Por que empresas voltam"
          itens={beneficios}
        />
        <Processo />
        <CtaForm origem="landing-empresariais" eyebrow="Orçamento para empresas" />
      </main>
      <Footer />
      <WhatsAppFloat mensagem={mensagensWhatsapp.empresariais} origem="landing-empresariais" />
      <JsonLd data={schemaFaq(faqEmpresarial)} />
    </>
  );
}
