'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Campo, inputCls } from './Campo';
import { OpcaoBotao } from './OpcaoBotao';
import { Button } from '@/components/ui/Button';
import { empresa, whatsappLink, mensagensWhatsapp } from '@/data/empresa';
import { leadSchema, TIPOS, PERSONALIZACOES, PRAZOS } from '@/lib/lead-schema';
import {
  trackInitiateCheckout,
  trackFormStep,
  trackLead,
  trackContact,
} from '@/lib/analytics';
import { capturarUtm, lerUtm } from '@/lib/utm';

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
  const [status, setStatus] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle');
  const [erroGeral, setErroGeral] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
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
        return;
      }

      if (json.campos) {
        setErros(json.campos as Partial<Record<keyof Estado, string>>);
      }
      setErroGeral(json.erro || 'Não conseguimos enviar agora.');
      setStatus('erro');
    } catch {
      setErroGeral(
        'A conexão caiu no meio do caminho. Tenta de novo — ou chama no WhatsApp que a gente responde na hora.',
      );
      setStatus('erro');
    }
  }

  // ---------------------------------------------------------------- sucesso
  if (status === 'ok') {
    return (
      <div
        className={`rounded-sm border border-hairline-light bg-cream p-8 text-ink md:p-12 ${className}`}
      >
        <p className="font-sans text-label font-semibold uppercase text-gold">Pedido recebido</p>
        <h3 className="mt-5 font-display-mid text-[1.75rem] leading-snug text-ink">
          Recebemos. Agora é com a gente.
        </h3>
        <p className="mt-4 max-w-measure text-body-sm text-muted-on-light">
          Uma pessoa da equipe vai ler o seu pedido e responder pelo WhatsApp com as opções de
          tecido e o prazo real de produção. Se for urgente, chama direto — a gente prefere assim.
        </p>
        <div className="mt-8">
          <Button
            href={whatsappLink(mensagensWhatsapp.contato)}
            variant="outline-dark"
            onClick={() => trackContact({ canal: 'whatsapp', origem: `${origem}-pos-envio` })}
          >
            Falar no WhatsApp agora
          </Button>
        </div>
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
                  // Toque único já avança: o compromisso pedido a quem
                  // veio de anúncio é um toque, não um cadastro.
                  setTimeout(() => {
                    setPasso(2);
                    trackFormStep(2, TOTAL);
                  }, 160);
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
              <p role="alert" className="rounded-sm border border-gold bg-gold/10 p-4 text-body-sm text-ink">
                {erroGeral}
              </p>
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
              <Button type="button" onClick={avancar} className="w-full sm:w-auto">
                Continuar
              </Button>
            ) : (
              <Button type="submit" disabled={status === 'enviando'} className="w-full sm:w-auto">
                {status === 'enviando' ? 'Enviando…' : 'Enviar pedido de orçamento'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
