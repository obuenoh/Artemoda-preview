/**
 * Captura de UTM. Sem isso nao da para saber qual campanha trouxe cada lead,
 * e o site nasce para receber anuncio.
 *
 * A primeira visita grava; visitas seguintes nao sobrescrevem (first-touch),
 * porque o lead costuma voltar por busca direta depois de ver o anuncio.
 */

const CHAVE = 'am_utm';

export type Utm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  landing?: string;
  referrer?: string;
};

const CAMPOS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const;

export function capturarUtm(): void {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const encontrados: Utm = {};

    for (const campo of CAMPOS) {
      const valor = params.get(campo);
      if (valor) encontrados[campo] = valor.slice(0, 200);
    }

    if (Object.keys(encontrados).length === 0) return;

    if (sessionStorage.getItem(CHAVE)) return; // first-touch vence

    encontrados.landing = window.location.pathname;
    encontrados.referrer = document.referrer || undefined;

    sessionStorage.setItem(CHAVE, JSON.stringify(encontrados));
  } catch {
    // Navegador com storage bloqueado: o lead ainda e enviado, so sem atribuicao.
  }
}

export function lerUtm(): Utm {
  if (typeof window === 'undefined') return {};
  try {
    const bruto = sessionStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Utm) : {};
  } catch {
    return {};
  }
}
