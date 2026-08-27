import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { metadados } from '@/lib/seo';
import { empresa } from '@/data/empresa';

export const metadata = metadados({
  titulo: 'Política de privacidade',
  descricao:
    'Como a Arte e Moda coleta, usa e protege os dados enviados pelo formulário de orçamento, conforme a LGPD.',
  caminho: '/politica-de-privacidade',
  noindex: true,
});

const secoes = [
  {
    titulo: 'Quem trata os seus dados',
    conteudo: [
      `Os dados enviados neste site são tratados por ${empresa.nome}, CNPJ ${empresa.cnpj}, com endereço em ${empresa.endereco.completo}. Para qualquer questão sobre privacidade, o contato é ${empresa.contato.email}.`,
    ],
  },
  {
    titulo: 'Quais dados coletamos',
    conteudo: [
      'Do formulário de orçamento: nome, empresa/escola/marca, WhatsApp, e-mail, cidade, tipo de produção, quantidade aproximada, prazo desejado, personalização pretendida, mensagem livre e, se você anexar, o arquivo de arte ou referência.',
      'De navegação: páginas visitadas, origem do acesso e parâmetros de campanha (UTM), coletados por cookies e ferramentas de medição como Google Analytics, Google Tag Manager e Meta Pixel.',
    ],
  },
  {
    titulo: 'Para que usamos',
    conteudo: [
      'Para responder ao seu pedido de orçamento, elaborar a proposta e dar continuidade ao atendimento comercial.',
      'Para entender quais campanhas e canais trazem contatos, e assim investir melhor em divulgação.',
      'Não vendemos, alugamos nem cedemos seus dados para terceiros com finalidade comercial.',
    ],
  },
  {
    titulo: 'Base legal',
    conteudo: [
      'O tratamento dos dados do formulário se apoia no seu consentimento, dado no momento do envio, e nos procedimentos preliminares de contrato (art. 7º, incisos I e V, da Lei 13.709/2018 — LGPD).',
    ],
  },
  {
    titulo: 'Com quem compartilhamos',
    conteudo: [
      'Com prestadores de serviço necessários à operação do site e do atendimento: serviço de envio de e-mail (Resend), hospedagem (Vercel) e ferramentas de medição (Google e Meta). Cada um trata os dados apenas para a finalidade contratada.',
      'Com parceiros de personalização (DTF, silk e bordado), quando for indispensável para executar o seu pedido — e nesse caso apenas o necessário para a produção.',
    ],
  },
  {
    titulo: 'Por quanto tempo guardamos',
    conteudo: [
      // TODO: definir prazo real de retencao com a operacao.
      'Mantemos os dados do orçamento enquanto durar o atendimento e pelo prazo necessário para cumprir obrigações legais e fiscais. Depois disso, são eliminados ou anonimizados.',
    ],
  },
  {
    titulo: 'Os seus direitos',
    conteudo: [
      'Você pode pedir confirmação do tratamento, acesso, correção, anonimização, portabilidade ou eliminação dos seus dados, além de revogar o consentimento a qualquer momento.',
      `Para exercer qualquer desses direitos, escreva para ${empresa.contato.email} ou chame no WhatsApp ${empresa.contato.whatsappFormatado}.`,
    ],
  },
  {
    titulo: 'Cookies',
    conteudo: [
      'Usamos cookies próprios e de terceiros para medir audiência e atribuir campanhas. Você pode bloqueá-los nas configurações do seu navegador — o site continua funcionando, mas a medição fica incompleta.',
    ],
  },
  {
    titulo: 'Segurança',
    conteudo: [
      'O site trafega em conexão criptografada e o acesso aos pedidos de orçamento é restrito à equipe que faz o atendimento.',
    ],
  },
];

export default function PoliticaPage() {
  return (
    <>
      <Header />
      <main id="conteudo" className="fabric bg-navy pt-[72px]">
        <div className="container-am py-20 md:py-28">
          <Eyebrow>LGPD</Eyebrow>
          <h1 className="mt-6 max-w-[20ch] font-display text-display-l text-cream">
            Política de privacidade
          </h1>
          <p className="mt-4 font-sans text-label uppercase text-muted-on-dark">
            Última atualização: agosto de 2026
          </p>

          <div className="mt-16 max-w-measure space-y-12">
            {secoes.map((secao) => (
              <section key={secao.titulo}>
                <h2 className="font-sans text-card-title font-semibold uppercase tracking-[0.08em] text-cream">
                  {secao.titulo}
                </h2>
                <span aria-hidden="true" className="mt-4 block h-px w-6 bg-gold" />
                <div className="mt-5 space-y-4">
                  {secao.conteudo.map((paragrafo, i) => (
                    <p key={i} className="text-body-sm text-muted-on-dark">
                      {paragrafo}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-sm border border-dashed border-gold/50 p-6">
            <p className="font-sans text-label font-semibold uppercase text-gold">
              TODO: revisão jurídica
            </p>
            <p className="mt-3 max-w-measure text-body-sm text-muted-on-dark">
              Este texto cobre o que o site realmente coleta e é honesto sobre isso, mas não
              substitui revisão por advogado. Falta definir o prazo real de retenção de dados e
              confirmar se haverá encarregado (DPO) nomeado.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
