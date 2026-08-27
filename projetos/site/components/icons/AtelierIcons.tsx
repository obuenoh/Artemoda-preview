import type { SVGProps } from 'react';

/**
 * Conjunto proprio, vocabulario de atelie. Traco de 1px em grade de 24.
 * Nenhum caminhao, nenhuma medalha, nenhum aperto de mao — o generico
 * de biblioteca de icone e o que faz um site de confeccao parecer todos
 * os outros.
 */
export type IconName =
  | 'dedal'
  | 'agulha'
  | 'fita'
  | 'brasil'
  | 'travete'
  | 'etiqueta'
  | 'tesoura'
  | 'tecido';

type Props = SVGProps<SVGSVGElement> & { name: IconName };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

const paths: Record<IconName, React.ReactNode> = {
  // Dedal: qualidade — a peca que protege o dedo de quem costura a mao.
  dedal: (
    <>
      <path d="M7.5 20.5V11a4.5 4.5 0 0 1 9 0v9.5z" />
      <path d="M6.5 20.5h11" />
      <path d="M9.6 8.6h.01M12 8h.01M14.4 8.6h.01M9.6 11.4h.01M12 10.8h.01M14.4 11.4h.01M9.6 14.2h.01M12 13.6h.01M14.4 14.2h.01" />
    </>
  ),
  // Agulha com linha: fabricacao propria.
  agulha: (
    <>
      <path d="M20 3.5 8.5 15" />
      <path d="m6 17.5-1.6 2.9 2.9-1.6" />
      <path d="M18.2 5.3a1.6 1.6 0 1 0 0-.1" />
      <path d="M17 6.5c-2.6.4-4.6 1-6.4 3.2-1.8 2.2-4 2.6-6 1.6" />
    </>
  ),
  // Fita metrica: atendimento sob medida.
  fita: (
    <>
      <path d="M3 8.5h18v7H3z" />
      <path d="M6.5 8.5v3M9.5 8.5v4.5M12.5 8.5v3M15.5 8.5v4.5M18.5 8.5v3" />
    </>
  ),
  // Contorno do Brasil em hairline: entrega nacional.
  brasil: (
    <path d="M9.6 2.6 12 4l2.6-.5 1.4 1.9-.6 2 1.9 1 1.1 2.4-1 2.2.4 2.3-1.7 1.6-.6 2.2-2.2 1.4-2.6.9-2.4-1.3-1.6-2.4-2.2-1.3-.4-2.4 1.3-2.1-1.1-2.2 1.5-1.9-.2-2.2z" />
  ),
  // Travete: dois fios travados — parcerias.
  travete: (
    <>
      <path d="M4 9h16M4 15h16" />
      <path d="M7 6.5v11M12 6.5v11M17 6.5v11" />
    </>
  ),
  // Etiqueta costurada: compromisso — o nome da marca preso na peca.
  etiqueta: (
    <>
      <path d="M5 6.5h14v11H5z" />
      <path d="M5 9h14M5 15h14" />
      <path d="M8 11.5h8M8 13h5" strokeDasharray="2 2" />
    </>
  ),
  // Tesoura: Studio — onde a peca comeca a ser cortada.
  tesoura: (
    <>
      <path d="M6.5 4 17 18.5M17.5 4 7 18.5" />
      <circle cx="6" cy="19.5" r="2" />
      <circle cx="18" cy="19.5" r="2" />
    </>
  ),
  // Rolo de tecido: Casual.
  tecido: (
    <>
      <path d="M3 7c2.5-1.6 4.5-1.6 7 0s4.5 1.6 7 0" />
      <path d="M3 12c2.5-1.6 4.5-1.6 7 0s4.5 1.6 7 0" />
      <path d="M3 17c2.5-1.6 4.5-1.6 7 0s4.5 1.6 7 0" />
      <path d="M20 5.5v13" />
    </>
  ),
};

export function AtelierIcon({ name, ...rest }: Props) {
  return (
    <svg {...base} {...rest}>
      {paths[name]}
    </svg>
  );
}
