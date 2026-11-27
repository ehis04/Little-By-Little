// Single source of truth for design tokens (docs/02 section 5). Mirrored into tailwind.config.js.
// This is the only file in the app allowed to contain colour values; CI greps for the rest.

export type ColourName =
  | 'bg'
  | 'surface'
  | 'surfaceMuted'
  | 'border'
  | 'borderStrong'
  | 'text'
  | 'textSecondary'
  | 'textTertiary'
  | 'primary'
  | 'onPrimary'
  | 'accent'
  | 'accentText'
  | 'positive'
  | 'warning'
  | 'danger'
  | 'info'
  | 'chain1'
  | 'chain2'
  | 'chain3'
  | 'chain4'
  | 'chain5';

export type Palette = Record<ColourName, string>;
export type Scheme = 'light' | 'dark';

const light: Palette = {
  bg: '#FAF8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F2EFE8',
  border: '#E4E0D7',
  borderStrong: '#85807A',
  text: '#1F2421',
  textSecondary: '#5B625E',
  textTertiary: '#666D68',
  primary: '#2E6B4F',
  onPrimary: '#FFFFFF',
  accent: '#E8A33D',
  accentText: '#8A5300',
  positive: '#256E46',
  warning: '#8A5A00',
  danger: '#B3261E',
  info: '#2F5D8A',
  // ASSUMPTION: muted neutral hues for chain chips (never retailer brand colours). Reviewed in M0-07.
  chain1: '#CFE0D6',
  chain2: '#D6DCEB',
  chain3: '#EBDDCB',
  chain4: '#E3D3E0',
  chain5: '#DDDDCB',
};

const dark: Palette = {
  bg: '#121513',
  surface: '#1A1E1B',
  surfaceMuted: '#232824',
  border: '#2E3430',
  borderStrong: '#727A74',
  text: '#ECEFEA',
  textSecondary: '#A8B0AA',
  textTertiary: '#8F9791',
  primary: '#7CC9A0',
  onPrimary: '#0E1A13',
  accent: '#F0B75A',
  accentText: '#F0B75A',
  positive: '#7CC9A0',
  warning: '#E8B45A',
  danger: '#F2877E',
  info: '#8DB6E0',
  chain1: '#2B3D33',
  chain2: '#2C3345',
  chain3: '#433A2C',
  chain4: '#3D3040',
  chain5: '#3A3A2C',
};

export const colours: Record<Scheme, Palette> = { light, dark };

/** 4-pt grid. Keys match the Tailwind spacing scale (p-4 = 16). */
export const spacing = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 14: 56 } as const;

export const layout = {
  screenPaddingX: 20,
  cardPadding: 16,
  cardGap: 12,
  maxContentWidth: 1120,
} as const;

export const radius = { none: 0, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 } as const;

export const breakpoints = { md: 600, lg: 1024 } as const;

export const typography = {
  display: { size: 32, lineHeight: 38, weight: 600 },
  title: { size: 24, lineHeight: 30, weight: 600 },
  headline: { size: 20, lineHeight: 26, weight: 600 },
  body: { size: 16, lineHeight: 24, weight: 400 },
  bodyStrong: { size: 16, lineHeight: 24, weight: 600 },
  callout: { size: 15, lineHeight: 22, weight: 400 },
  caption: { size: 13, lineHeight: 18, weight: 500 },
} as const;

export const fontFamily = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
} as const;

export const motion = { fast: 120, base: 200, slow: 320 } as const;

/** Hit-area minimums (docs/02 section 7). */
export const touchTarget = { min: 44, button: 48 } as const;
