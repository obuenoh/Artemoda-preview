import type { Config } from 'tailwindcss';

/**
 * Tokens de design da Arte e Moda.
 * Nenhuma cor fora da paleta do manual. `navy-deep` e `navy-raised` nao sao
 * cores novas: sao o navy com preto a 40% e com creme a 6%, pre-calculados.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#15263D',
          deep: '#182230',
          raised: '#223248',
        },
        cream: '#F5F2EC',
        ink: '#1C1C1C',
        gold: '#B58B57',
        gray: {
          DEFAULT: '#707070',
          line: '#707070',
        },
        // Texto secundario nao entra aqui: e alpha da propria paleta,
        // definido em globals.css como --muted-on-light / --muted-on-dark.
        // Cinza puro reprova AA nos dois fundos (4,43:1 e 3,08:1).
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5.5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'display-l': ['clamp(2rem, 4.2vw, 3.25rem)', { lineHeight: '1.15', letterSpacing: '0' }],
        'display-m': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '0' }],
        numeral: ['clamp(3rem, 6vw, 5rem)', { lineHeight: '1', letterSpacing: '0' }],
        section: ['clamp(1.375rem, 2.4vw, 1.875rem)', { lineHeight: '1.25', letterSpacing: '0.14em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.22em' }],
        'card-title': ['1.0625rem', { lineHeight: '1.35', letterSpacing: '0.02em' }],
        body: ['1.0625rem', { lineHeight: '1.7', letterSpacing: '0' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.65', letterSpacing: '0' }],
        label: ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.22em' }],
      },
      maxWidth: {
        container: '1240px',
        measure: '64ch',
      },
      borderRadius: {
        // Cantos praticamente retos. Nada maior que 4px no projeto.
        DEFAULT: '2px',
        sm: '2px',
        md: '4px',
      },
      spacing: {
        section: '6rem', // 96px  (mobile)
        'section-lg': '10rem', // 160px (desktop)
        gutter: '1.5rem',
        'gutter-lg': '3rem',
      },
      borderColor: {
        hairline: 'rgba(181, 139, 87, 0.28)',
        'hairline-strong': 'rgba(181, 139, 87, 0.55)',
        'hairline-light': 'rgba(28, 28, 28, 0.14)',
      },
      keyframes: {
        'stitch-draw': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
      },
      transitionTimingFunction: {
        seam: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
