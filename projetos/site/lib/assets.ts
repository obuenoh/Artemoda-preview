/**
 * Utilitário para resolver URLs de assets estáticos (imagens, arquivos)
 * respeitando o basePath quando o site é exportado para GitHub Pages ou subcaminhos.
 */

const basePath = process.env.NEXT_PUBLIC_PREVIEW_ESTATICO === '1' ? '/Artemoda-preview/site' : '';

export function assetUrl(src: string): string {
  if (!src) return src;
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  if (basePath && src.startsWith('/') && !src.startsWith(basePath)) {
    return `${basePath}${src}`;
  }

  return src;
}
