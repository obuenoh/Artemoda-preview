import type { Config } from 'tailwindcss';

/**
 * Mesma identidade do site, densidade de ferramenta de trabalho.
 * A inversao e deliberada: o site e escuro-dominante, o sistema e claro —
 * ela usa em pe, no chao de fabrica, sob luz forte.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#15263D', deep: '#101A29', raised: '#223248' },
        cream: { DEFAULT: '#F5F2EC', alt: '#FBF9F5', escuro: '#EDE8DE' },
        ink: '#1C1C1C',
        gold: '#B58B57',
        cinza: '#707070',
        // Semanticas, separadas do acento. Duas so: o estado intermediario
        // e codificado na forma (traco tracejado), nao numa terceira cor
        // que brigaria com o dourado.
        ok: '#3F6B57',
        alerta: '#9B3B2E',
      },
      fontFamily: {
        sans: ['var(--fonte-ui)', 'system-ui', 'sans-serif'],
        display: ['var(--fonte-display)', 'Georgia', 'serif'],
        mono: ['var(--fonte-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        rotulo: ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.16em' }],
        dado: ['0.875rem', { lineHeight: '1.5' }],
      },
      borderRadius: { DEFAULT: '3px', sm: '2px', md: '3px' },
      borderColor: {
        fio: 'rgba(28, 28, 28, 0.13)',
        'fio-ouro': 'rgba(181, 139, 87, 0.30)',
      },
    },
  },
  plugins: [],
};

export default config;
