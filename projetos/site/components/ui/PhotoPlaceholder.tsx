import Image from 'next/image';
import { assetUrl } from '@/lib/assets';

const ratios = {
  '3:2': 'aspect-[3/2]',
  '4:5': 'aspect-[4/5]',
  '1:1': 'aspect-square',
} as const;

/**
 * Nao ha fotos reais ainda. Placeholder nao e caixa cinza: e bloco solido
 * da paleta com moldura hairline e legenda dizendo exatamente qual foto
 * entra ali. Quando `src` chegar (via data/galeria.ts), vira next/image.
 */
export function PhotoPlaceholder({
  descricao,
  proporcao = '3:2',
  tone = 'dark',
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 33vw',
}: {
  descricao: string;
  proporcao?: keyof typeof ratios;
  tone?: 'dark' | 'light';
  className?: string;
  priority?: boolean;
  sizes?: string;
  src?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm border ${
        tone === 'dark'
          ? 'border-hairline bg-navy-raised'
          : 'border-hairline-light bg-cream'
      } ${ratios[proporcao]} ${className}`}
    >
      <div className="absolute inset-3 rounded-sm border border-dashed border-gold/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span
          className={`font-sans text-label font-medium uppercase ${
            tone === 'dark' ? 'text-gold/70' : 'text-gold'
          }`}
        >
          Foto pendente
        </span>
        <span
          className={`max-w-[22ch] font-sans text-label font-medium uppercase ${
            tone === 'dark' ? 'text-muted-on-dark' : 'text-muted-on-light'
          }`}
        >
          {descricao} · {proporcao}
        </span>
      </div>
    </div>
  );
}

/** Versao que ja aceita foto real — usada quando `src` existir no data file. */
export function Foto({
  src,
  alt,
  proporcao = '3:2',
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 33vw',
}: {
  src: string;
  alt: string;
  proporcao?: keyof typeof ratios;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const imgSrc = assetUrl(src);

  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-hairline ${ratios[proporcao]} ${className}`}
    >
      <Image src={imgSrc} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
