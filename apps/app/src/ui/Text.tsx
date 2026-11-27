import { Text as RNText, type TextProps } from 'react-native';

export type TextVariant =
  | 'display'
  | 'title'
  | 'headline'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'caption';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'primary'
  | 'onPrimary'
  | 'accent'
  | 'positive'
  | 'warning'
  | 'danger'
  | 'info';

// Full class names so Tailwind can see them. Sizes and weights mirror docs/02 section 5.2.
const variantClass: Record<TextVariant, string> = {
  display: 'text-display font-semibold',
  title: 'text-title font-semibold',
  headline: 'text-headline font-semibold',
  body: 'text-body font-regular',
  bodyStrong: 'text-body font-semibold',
  callout: 'text-callout font-regular',
  caption: 'text-caption font-medium',
};

const toneClass: Record<TextTone, string> = {
  default: 'text-text',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  primary: 'text-primary',
  onPrimary: 'text-on-primary',
  accent: 'text-accent-text',
  positive: 'text-positive',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

/** Dense rows cap font scaling at 1.6 (docs/02 section 5.2). Everything else scales freely. */
export const DENSE_FONT_MULTIPLIER = 1.6;

export type Props = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Tabular figures for prices and totals. */
  tabular?: boolean;
  dense?: boolean;
  className?: string;
};

/** The only way to render text. Variants map to type tokens. */
export function Text({
  variant = 'body',
  tone = 'default',
  tabular = false,
  dense = false,
  className,
  style,
  accessibilityRole,
  ...rest
}: Props) {
  const classes = [variantClass[variant], toneClass[tone], className].filter(Boolean).join(' ');
  return (
    <RNText
      {...rest}
      accessibilityRole={accessibilityRole}
      maxFontSizeMultiplier={dense ? DENSE_FONT_MULTIPLIER : rest.maxFontSizeMultiplier}
      className={classes}
      style={[tabular ? { fontVariant: ['tabular-nums'] } : null, style]}
    />
  );
}
