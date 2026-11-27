/** @type {import('tailwindcss').Config} */
// Mirrors src/theme/tokens.ts. Colours resolve to CSS variables that ThemeProvider sets from the
// tokens for the active scheme, so no colour value lives here. Spacing, radius and type are mirrored
// as numbers; src/theme/__tests__/tailwind-parity.test.ts fails if they drift from tokens.ts.
const channel = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    screens: { md: '600px', lg: '1024px' },
    colors: {
      transparent: 'transparent',
      bg: channel('bg'),
      surface: channel('surface'),
      'surface-muted': channel('surfaceMuted'),
      border: channel('border'),
      'border-strong': channel('borderStrong'),
      text: channel('text'),
      'text-secondary': channel('textSecondary'),
      'text-tertiary': channel('textTertiary'),
      primary: channel('primary'),
      'on-primary': channel('onPrimary'),
      accent: channel('accent'),
      'accent-text': channel('accentText'),
      positive: channel('positive'),
      warning: channel('warning'),
      danger: channel('danger'),
      info: channel('info'),
      'chain-1': channel('chain1'),
      'chain-2': channel('chain2'),
      'chain-3': channel('chain3'),
      'chain-4': channel('chain4'),
      'chain-5': channel('chain5'),
    },
    spacing: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      14: '56px',
    },
    borderRadius: {
      none: '0px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
    fontFamily: {
      regular: ['Inter_400Regular'],
      medium: ['Inter_500Medium'],
      semibold: ['Inter_600SemiBold'],
    },
    fontSize: {
      display: ['32px', { lineHeight: '38px' }],
      title: ['24px', { lineHeight: '30px' }],
      headline: ['20px', { lineHeight: '26px' }],
      body: ['16px', { lineHeight: '24px' }],
      callout: ['15px', { lineHeight: '22px' }],
      caption: ['13px', { lineHeight: '18px' }],
    },
    extend: {
      maxWidth: { content: '1120px' },
    },
  },
  plugins: [],
};
