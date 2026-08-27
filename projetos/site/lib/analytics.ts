'use client';

/**
 * Camada unica de eventos. Todo disparo passa por aqui — nenhum componente
 * chama fbq/gtag direto, para que trocar de ferramenta seja um arquivo so.
 *
 * GTM e o container; GA4 e Meta Pixel entram por ele. O Conversions API
 * (server-side) reaproveita os mesmos nomes de evento em /api/lead.
 */

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Params[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function push(event: string, params: Params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

function fbq(track: 'track' | 'trackCustom', name: string, params: Params = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq(track, name, params);
}

/** Formulario enviado com sucesso. */
export function trackLead(params: Params = {}) {
  push('lead', params);
  fbq('track', 'Lead', params);
}

/** Clique em qualquer ponto de contato direto (WhatsApp, telefone, e-mail). */
export function trackContact(params: Params = {}) {
  push('contact', params);
  fbq('track', 'Contact', params);
}

/** Entrada em uma landing especifica — usado para separar publicos no Ads. */
export function trackViewContent(params: Params = {}) {
  push('view_content', params);
  fbq('track', 'ViewContent', params);
}

/** Primeiro toque no formulario multi-step. */
export function trackInitiateCheckout(params: Params = {}) {
  push('initiate_checkout', params);
  fbq('track', 'InitiateCheckout', params);
}

/** Avanco entre passos — util para achar onde o formulario perde gente. */
export function trackFormStep(step: number, total: number) {
  push('form_step', { form_step: step, form_total: total });
}
