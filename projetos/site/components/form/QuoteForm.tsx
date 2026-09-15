'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Campo, inputCls } from './Campo';
import { OpcaoBotao } from './OpcaoBotao';
import { Button } from '@/components/ui/Button';
import { empresa, whatsappLink, mensagensWhatsapp } from '@/data/empresa';
import { leadSchema, TIPOS, PERSONALIZACOES, PRAZOS } from '@/lib/lead-schema';
import {
  gerarMensagemOrcamento,
  criarLinkWhatsappOrcamento,
} from '@/lib/whatsapp-orcamento';
import {
  trackInitiateCheckout,
  trackFormStep,
  trackLead,
  trackContact,
} from '@/lib/analytics';
import { capturarUtm, lerUtm } from '@/lib/utm';

function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24M8.53 7.33c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.35.99 2.51.12.17 1.69 2.58 4.1 3.61.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41z" />
    </svg>
  );
}

type Tipo = (typeof TIPOS)[number];
type Prazo = (typeof PRAZOS)[number];
type Personalizacao = (typeof PERSONALIZACOES)[number];

type Estado = {
  tipo: Tipo | '';
  quantidade: string;
  prazo: Prazo | '';
  personalizacao: Personalizacao[];
  nome: string;
  organizacao: string;
  whatsapp: string;
  email: string;
  cidade: string;
  mensagem: string;
  consentimento: boolean;
  website: string; // honeypot
};

const inicial: Estado = {
  tipo: '',
  quantidade: '',
  prazo: '',
  personalizacao: [],
  nome: '',
  organizacao: '',
  whatsapp: '',
  email: '',
  cidade: '',
  mensagem: '',
  consentimento: false,
  website: '',
};

const TOTAL = 5;

const titulos = [
  'O que você precisa produzir?',
  'Quantas peças e para quando?',
  'Qual personalização entra na peça?',
  'Para quem enviamos a proposta?',
  'Mais alguma coisa que ajude?',
] as const;

/** Campos validados em cada passo. */
const camposPorPasso: Record<number, (keyof Estado)[]> = {
  1: ['tipo'],
  2: ['quantidade', 'prazo'],
  3: ['personalizacao'],
  4: ['nome', 'organizacao', 'whatsapp', 'email', 'cidade'],
  5: ['consentimento'],
};

function mascararWhatsapp(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function QuoteForm({
  origem,
  tipoInicial,
  className = '',
}: {
  origem: string;
  tipoInicial?: Tipo;
  className?: string;
}) {
  const [passo, setPasso] = useState(1);
  const [dados, setDados] = useState<Estado>({ ...inicial, tipo: tipoInicial ?? '' });
  const [erros, setErros] = useState<Partial<Record<keyof Estado, string>>>({});
  const [status, setStatus] = useState<'idle' | 'enviando' | 'ok' | 'erro' | 'previa'>('idle');
  const [erroGeral, setErroGeral] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [copiado, setCopiado] = useState(false);
  const iniciado = useRef(false);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    capturarUtm();
  }, []);

  function marcarInicio() {
    if (iniciado.current) return;
    iniciado.current = true;
    trackInitiateCheckout({ origem });
  }

  function set<K extends keyof Estado>(campo: K, valor: Estado[K]) {
    marcarInicio();
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function validar(passoAlvo: number): boolean {
    const campos = camposPorPasso[passoAlvo] ?? [];
    const shape = Object.fromEntries(campos.map((c) => [c, true]));
    const parcial = leadSchema.pick(shape as never).safeParse(dados);

    if (parcial.success) {
      setErros({});
      return true;
    }

    const novos: Partial<Record<keyof Estado, string>> = {};
    for (const issue of parcial.error.issues) {
      const campo = issue.path[0] as keyof Estado;
      if (!novos[campo]) novos[campo] = issue.message;
    }
    setErros(novos);
    return false;
  }

  function avancar() {
    if (!validar(passo)) return;
    const proximo = Math.min(passo + 1, TOTAL);
    setPasso(proximo);
    trackFormStep(proximo, TOTAL);
    // Sem pulo de pagina: rola só o painel para o topo do formulário.
    painel.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function voltar() {
    setErros({});
    setPasso((p) => Math.max(1, p - 1));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!validar(5)) return;

    setStatus('enviando');
    setErroGeral('');

    const linkWhatsapp = criarLinkWhatsappOrcamento(dados, Boolean(arquivo));

    // Prévia estática (GitHub Pages): não existe servidor para receber o
    // envio de verdade. Abre o WhatsApp com o orçamento e mostra a confirmação.
    if (process.env.NEXT_PUBLIC_PREVIEW_ESTATICO === '1') {
      setStatus('previa');
      trackLead({ tipo: dados.tipo, origem, quantidade: dados.quantidade });
      try {
        window.open(linkWhatsapp, '_blank');
      } catch {
        // Bloqueador de popups — usuário pode clicar no botão da tela
      }
      return;
    }

    try {
      const form = new FormData();
      form.append(
        'payload',
        JSON.stringify({ ...dados, utm: lerUtm(), origem }),
      );
      if (arquivo) form.append('arquivo', arquivo);

      const resposta = await fetch('/api/lead', { method: 'POST', body: form });
      const json = (await resposta.json()) as {
        ok: boolean;
        erro?: string;
        campos?: Record<string, string>;
      };

      if (json.ok) {
        trackLead({ tipo: dados.tipo, origem, quantidade: dados.quantidade });
        setStatus('ok');
        try {
          window.open(linkWhatsapp, '_blank');
        } catch {
          // Bloqueador de popups
        }
        return;
      }

      if (json.campos) {
        setErros(json.campos as Partial<Record<keyof Estado, string>>);
      }
      setErroGeral(json.erro || 'Não conseguimos salvar no servidor agora.');
      setStatus('erro');
    } catch {
      setErroGeral(
        'Houve uma instabilidade na conexão com o servidor. Mas seu orçamento está pronto: clique no botão abaixo para enviá-lo diretamente pelo WhatsApp!',
      );
      setStatus('erro');
    }
  }

  const linkWhatsappOrcamento = criarLinkWhatsappOrcamento(dados, Boolean(arquivo));
  const mensagemOrcamento = gerarMensagemOrcamento(dados, Boolean(arquivo));

  // ------------------------------------------------------- tela de confirmacao (ok ou previa)
  if (status === 'previa' || status === 'ok') {
    const isPrevia = status === 'previa';
    return (
      <div
        className={`rounded-sm border border-hairline-light bg-cream p-8 text-ink md:p-12 ${className}`}
      >
        <div className="inline-flex items-center gap-2 rounded-[1px] bg-gold/15 px-3 py-1 text-gold font-sans text-label font-semibold uppercase">
          <WhatsAppIcon className="h-3.5 w-3.5" />
          {isPrevia ? 'Orçamento Pronto para Envio' : 'Orçamento Gerado com Sucesso'}
        </div>

        <h3 className="mt-5 font-display-mid text-[1.75rem] leading-snug text-ink">
          {isPrevia
            ? 'Seu orçamento está pronto para ser enviado no WhatsApp.'
            : 'Recebemos seu pedido! Envie também pelo WhatsApp para resposta imediata.'}
        </h3>

        <p className="mt-4 max-w-measure text-body-sm text-muted-on-light">
          {isPrevia
            ? 'Formatamos todos os detalhes do seu pedido com as peças, quantidades e personalizações. Uma conversa no WhatsApp foi aberta para você enviar com 1 toque.'
            : 'Seu pedido foi registrado em nosso sistema. Para acelerar o retorno com a nossa equipe comercial e fábrica, envie o resumo formatado no WhatsApp:'}
        </p>

        {/* Resumo do que foi orçado */}
        <div className="mt-6 rounded-sm border border-gold/30 bg-white/70 p-5 text-ink shadow-sm">
          <div className="flex items-center justify-between border-b border-hairline-light pb-3">
            <p className="font-sans text-label font-semibold uppercase text-gold">
              O que está no seu orçamento
            </p>
            <span className="font-sans text-[0.6875rem] uppercase text-muted-on-light">
              Arte e Moda
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5 text-body-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-ink/70">Necessidade:</span>{' '}
              <strong className="font-semibold text-ink">{dados.tipo || 'A definir'}</strong>
            </div>
            <div>
              <span className="font-medium text-ink/70">Quantidade:</span>{' '}
              <strong className="font-semibold text-ink">{dados.quantidade || 'A definir'}</strong>
            </div>
            <div>
              <span className="font-medium text-ink/70">Prazo desejado:</span>{' '}
              <strong className="font-semibold text-ink">{dados.prazo || 'A definir'}</strong>
            </div>
            <div>
              <span className="font-medium text-ink/70">Personalização:</span>{' '}
              <strong className="font-semibold text-ink">
                {dados.personalizacao.length > 0 ? dados.personalizacao.join(', ') : 'Não definida'}
              </strong>
            </div>
            <div className="sm:col-span-2 border-t border-hairline-light pt-2 text-[0.8125rem]">
              <span className="font-medium text-ink/70">Contato:</span>{' '}
              <span className="text-ink font-semibold">{dados.nome}</span>{' '}
              {dados.organizacao ? `· ${dados.organizacao}` : ''}{' '}
              {dados.whatsapp ? `· ${dados.whatsapp}` : ''}{' '}
              {dados.cidade ? `· ${dados.cidade}` : ''}
            </div>
            {dados.mensagem && (
              <div className="sm:col-span-2 border-t border-hairline-light pt-2 text-[0.8125rem] text-muted-on-light italic">
                &ldquo;{dados.mensagem}&rdquo;
              </div>
            )}
            {arquivo && (
              <div className="sm:col-span-2 text-[0.75rem] text-gold font-medium">
                📎 Anexo selecionado: {arquivo.name}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button
            href={linkWhatsappOrcamento}
            variant="primary"
            onClick={() =>
              trackContact({
                canal: 'whatsapp',
                origem: `${origem}-${isPrevia ? 'previa' : 'pos-envio'}-orcamento`,
              })
            }
            className="w-full sm:w-auto"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Enviar para o WhatsApp agora
          </Button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(mensagemOrcamento);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2500);
            }}
            className="inline-flex items-center justify-center font-sans text-label font-semibold uppercase text-ink underline decoration-gold underline-offset-4 hover:text-gold"
          >
            {copiado ? '✓ Orçamento copiado!' : 'Copiar texto do orçamento'}
          </button>
        </div>

        <p className="mt-4 text-[0.75rem] text-muted-on-light">
          Caso o WhatsApp não tenha aberto automaticamente na sua tela, clique no botão dourado acima.
        </p>
      </div>
    );
  }

  const progresso = Math.round(((passo - 1) / TOTAL) * 100);

  return (
    <div
      ref={painel}
      className={`rounded-sm border border-hairline-light bg-cream p-6 text-ink md:p-10 ${className}`}
    >
      {/* Barra de progresso */}
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-sans text-label font-semibold uppercase text-gold">
            Passo {passo} de {TOTAL}
          </p>
          <p className="font-sans text-label uppercase text-muted-on-light">
            Leva menos de um minuto
          </p>
        </div>
        <div
          className="mt-3 h-px w-full bg-ink/12"
          role="progressbar"
          aria-valuenow={passo}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-label="Progresso do orçamento"
        >
          <div
            className="h-px bg-gold transition-all duration-500 ease-seam"
            style={{ width: `${Math.max(progresso, 6)}%` }}
          />
        </div>
      </div>

      <h3 className="mt-8 font-display-mid text-[1.5rem] leading-snug text-ink">
        {titulos[passo - 1]}
      </h3>

      <form onSubmit={enviar} noValidate className="mt-8">
        {/* Honeypot: invisível para gente, irresistível para bot. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Não preencha este campo</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={dados.website}
            onChange={(e) => setDados((d) => ({ ...d, website: e.target.value }))}
          />
        </div>

        {passo === 1 && (
          <div role="radiogroup" aria-label="Tipo de necessidade" className="grid gap-3">
            {TIPOS.map((tipo) => (
              <OpcaoBotao
                key={tipo}
                label={tipo}
                selecionado={dados.tipo === tipo}
                onClick={() => {
                  set('tipo', tipo);
                }}
              />
            ))}
            {erros.tipo && (
              <p role="alert" className="text-body-sm text-ink">
                <span aria-hidden="true" className="mr-2 text-gold">↳</span>
                {erros.tipo}
              </p>
            )}
          </div>
        )}

        {passo === 2 && (
          <div className="grid gap-6">
            <Campo id="quantidade" label="Quantidade aproximada" erro={erros.quantidade}>
              <input
                id="quantidade"
                className={inputCls}
                inputMode="numeric"
                placeholder={`ex: 120 peças (mínimo ${empresa.producao.pedidoMinimo})`}
                value={dados.quantidade}
                aria-invalid={Boolean(erros.quantidade)}
                aria-describedby={erros.quantidade ? 'quantidade-erro' : undefined}
                onChange={(e) => set('quantidade', e.target.value)}
              />
              {(() => {
                const match = dados.quantidade.match(/\d+/);
                const num = match ? parseInt(match[0], 10) : null;
                if (num !== null && num > 0 && num < empresa.producao.pedidoMinimo && !erros.quantidade) {
                  return (
                    <p role="alert" className="mt-2 text-body-sm text-gold font-medium">
                      <span aria-hidden="true" className="mr-2 text-gold">↳</span>
                      Nosso pedido mínimo de confecção é de {empresa.producao.pedidoMinimo} peças.
                    </p>
                  );
                }
                return null;
              })()}
            </Campo>

            <fieldset>
              <legend className="font-sans text-label font-semibold uppercase text-ink">
                Prazo desejado
              </legend>
              <div role="radiogroup" aria-label="Prazo desejado" className="mt-3 grid gap-3">
                {PRAZOS.map((prazo) => (
                  <OpcaoBotao
                    key={prazo}
                    label={prazo}
                    selecionado={dados.prazo === prazo}
                    onClick={() => set('prazo', prazo)}
                  />
                ))}
              </div>
              {erros.prazo && (
                <p role="alert" className="mt-2 text-body-sm text-ink">
                  <span aria-hidden="true" className="mr-2 text-gold">↳</span>
                  {erros.prazo}
                </p>
              )}
            </fieldset>
          </div>
        )}

        {passo === 3 && (
          <div>
            <div role="group" aria-label="Personalização necessária" className="grid gap-3">
              {PERSONALIZACOES.map((opcao) => {
                const marcado = dados.personalizacao.includes(opcao);
                return (
                  <OpcaoBotao
                    key={opcao}
                    tipo="checkbox"
                    label={opcao}
                    selecionado={marcado}
                    onClick={() => {
                      const proximo = marcado
                        ? dados.personalizacao.filter((p) => p !== opcao)
                        : [...dados.personalizacao, opcao];
                      set('personalizacao', proximo);
                    }}
                  />
                );
              })}
            </div>
            <p className="mt-4 text-body-sm text-muted-on-light">
              Pode marcar mais de uma. Se não souber ainda, a gente indica o que se comporta
              melhor no tecido escolhido.
            </p>
            {erros.personalizacao && (
              <p role="alert" className="mt-2 text-body-sm text-ink">
                <span aria-hidden="true" className="mr-2 text-gold">↳</span>
                {erros.personalizacao}
              </p>
            )}
          </div>
        )}

        {passo === 4 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Campo id="nome" label="Seu nome" erro={erros.nome}>
              <input
                id="nome"
                className={inputCls}
                autoComplete="name"
                value={dados.nome}
                aria-invalid={Boolean(erros.nome)}
                onChange={(e) => set('nome', e.target.value)}
              />
            </Campo>

            <Campo id="organizacao" label="Empresa, escola ou marca" erro={erros.organizacao}>
              <input
                id="organizacao"
                className={inputCls}
                autoComplete="organization"
                value={dados.organizacao}
                aria-invalid={Boolean(erros.organizacao)}
                onChange={(e) => set('organizacao', e.target.value)}
              />
            </Campo>

            <Campo id="whatsapp" label="WhatsApp com DDD" erro={erros.whatsapp}>
              <input
                id="whatsapp"
                className={inputCls}
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 91234-5678"
                value={dados.whatsapp}
                aria-invalid={Boolean(erros.whatsapp)}
                onChange={(e) => set('whatsapp', mascararWhatsapp(e.target.value))}
              />
            </Campo>

            <Campo id="email" label="E-mail" erro={erros.email}>
              <input
                id="email"
                type="email"
                className={inputCls}
                autoComplete="email"
                value={dados.email}
                aria-invalid={Boolean(erros.email)}
                onChange={(e) => set('email', e.target.value)}
              />
            </Campo>

            <Campo id="cidade" label="Cidade" erro={erros.cidade} className="sm:col-span-2">
              <input
                id="cidade"
                className={inputCls}
                autoComplete="address-level2"
                value={dados.cidade}
                aria-invalid={Boolean(erros.cidade)}
                onChange={(e) => set('cidade', e.target.value)}
              />
            </Campo>
          </div>
        )}

        {passo === 5 && (
          <div className="grid gap-6">
            {/* Resumo do que está sendo orçado */}
            <div className="rounded-sm border border-gold/30 bg-gold/5 p-5 text-ink">
              <div className="flex items-center justify-between border-b border-gold/20 pb-2.5">
                <p className="font-sans text-label font-semibold uppercase text-gold">
                  Resumo do que você está orçando
                </p>
                <span className="font-sans text-[0.6875rem] uppercase text-muted-on-light">
                  Passos 1 a 4
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2.5 text-body-sm sm:grid-cols-2">
                <div>
                  <span className="font-medium text-ink/70">Produção:</span>{' '}
                  <strong className="font-semibold text-ink">{dados.tipo || 'A definir'}</strong>{' '}
                  {dados.quantidade ? `(${dados.quantidade})` : ''}
                </div>
                <div>
                  <span className="font-medium text-ink/70">Prazo:</span>{' '}
                  <strong className="font-semibold text-ink">{dados.prazo || 'A definir'}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium text-ink/70">Personalização:</span>{' '}
                  <strong className="font-semibold text-ink">
                    {dados.personalizacao.length > 0
                      ? dados.personalizacao.join(', ')
                      : 'Não informada'}
                  </strong>
                </div>
                <div className="sm:col-span-2 border-t border-gold/15 pt-2 text-[0.8125rem] text-ink/80">
                  <span className="font-medium text-ink/70">Contato:</span>{' '}
                  {dados.nome || 'Não informado'} {dados.organizacao ? `· ${dados.organizacao}` : ''}{' '}
                  {dados.whatsapp ? `· ${dados.whatsapp}` : ''} {dados.cidade ? `· ${dados.cidade}` : ''}
                </div>
              </div>
            </div>

            <Campo id="mensagem" label="Conte o que precisa" opcional erro={erros.mensagem}>
              <textarea
                id="mensagem"
                rows={4}
                className={inputCls}
                placeholder="Modelo, cor, tecido que você tem em mente, se já tem arte pronta…"
                value={dados.mensagem}
                onChange={(e) => set('mensagem', e.target.value)}
              />
            </Campo>

            <Campo id="arquivo" label="Arte ou referência" opcional>
              <input
                id="arquivo"
                type="file"
                accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                className="w-full rounded-sm border border-dashed border-ink/25 px-4 py-3 font-sans text-[0.8125rem] text-muted-on-light file:mr-4 file:rounded-sm file:border file:border-gold file:bg-transparent file:px-4 file:py-2 file:font-sans file:text-label file:font-semibold file:uppercase file:text-gold hover:border-gold"
              />
              <p className="mt-2 font-sans text-label uppercase text-muted-on-light">
                PDF, AI, EPS, SVG, PNG ou JPG · até 5 MB
              </p>
            </Campo>

            <div>
              <button
                type="button"
                role="checkbox"
                aria-checked={dados.consentimento}
                onClick={() => set('consentimento', !dados.consentimento)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[1px] border ${
                    dados.consentimento ? 'border-gold' : 'border-ink/30'
                  }`}
                >
                  {dados.consentimento && <span className="block h-2 w-2 rounded-[1px] bg-gold" />}
                </span>
                <span className="text-body-sm text-muted-on-light">
                  Autorizo a Arte e Moda a usar meus dados para responder este pedido de
                  orçamento, conforme a{' '}
                  <Link
                    href="/politica-de-privacidade"
                    className="text-ink underline decoration-gold underline-offset-4 hover:text-gold"
                  >
                    política de privacidade
                  </Link>
                  .
                </span>
              </button>
              {erros.consentimento && (
                <p role="alert" className="mt-2 text-body-sm text-ink">
                  <span aria-hidden="true" className="mr-2 text-gold">↳</span>
                  {erros.consentimento}
                </p>
              )}
            </div>

            {status === 'erro' && erroGeral && (
              <div
                role="alert"
                className="rounded-sm border border-gold bg-gold/10 p-5 text-body-sm text-ink space-y-3"
              >
                <p>{erroGeral}</p>
                <div>
                  <Button
                    href={linkWhatsappOrcamento}
                    variant="primary"
                    onClick={() =>
                      trackContact({ canal: 'whatsapp', origem: `${origem}-fallback-erro` })
                    }
                    className="w-full sm:w-auto"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Enviar orçamento pelo WhatsApp agora
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navegação */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="order-2 sm:order-1">
            {passo > 1 && (
              <button
                type="button"
                onClick={voltar}
                className="font-sans text-label font-semibold uppercase text-muted-on-light transition-colors hover:text-gold"
              >
                ← Voltar
              </button>
            )}
          </div>

          <div className="order-1 sm:order-2">
            {passo < TOTAL ? (
              <Button
                type="button"
                onClick={avancar}
                disabled={(() => {
                  if (passo === 2) {
                    const match = dados.quantidade.match(/\d+/);
                    const num = match ? parseInt(match[0], 10) : null;
                    if (num !== null && num > 0 && num < empresa.producao.pedidoMinimo) {
                      return true;
                    }
                  }
                  return false;
                })()}
                className="w-full sm:w-auto"
              >
                Continuar
              </Button>
            ) : (
              <Button type="submit" disabled={status === 'enviando'} className="w-full sm:w-auto">
                <WhatsAppIcon className="h-4 w-4" />
                {status === 'enviando' ? 'Enviando…' : 'Enviar orçamento pelo WhatsApp'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
