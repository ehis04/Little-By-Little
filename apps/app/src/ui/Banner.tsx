import { Info, ShieldCheck, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { sizes } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { Text, type TextTone } from './Text';

export type BannerVariant = 'info' | 'warning' | 'offline' | 'honesty';

type Props = { variant: BannerVariant; children: string; title?: string; testID?: string };

const icons: Record<BannerVariant, LucideIcon> = {
  info: Info,
  warning: TriangleAlert,
  offline: WifiOff,
  honesty: ShieldCheck,
};
const border: Record<BannerVariant, string> = {
  info: 'border-info',
  warning: 'border-warning',
  offline: 'border-border-strong',
  honesty: 'border-primary',
};
const tone: Record<BannerVariant, TextTone> = {
  info: 'info',
  warning: 'warning',
  offline: 'secondary',
  honesty: 'primary',
};

/** Icon, title and text always travel together: colour is never the only signal. */
export function Banner({ variant, children, title, testID }: Props) {
  const { colours } = useTheme();
  const Icon = icons[variant];
  const iconColour = { info: colours.info, warning: colours.warning, offline: colours.textSecondary, honesty: colours.primary }[variant];
  const heading = title ?? copy.ui.banner[variant];
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole={variant === 'warning' || variant === 'offline' ? 'alert' : 'summary'}
      accessibilityLabel={`${heading}. ${children}`}
      className={`flex-row gap-3 rounded-md border bg-surface p-3 ${border[variant]}`}
    >
      <Icon size={sizes.iconLarge} strokeWidth={sizes.iconStroke} color={iconColour} />
      <View className="flex-1">
        <Text variant="bodyStrong" tone={tone[variant]}>
          {heading}
        </Text>
        <Text variant="callout" tone="secondary">
          {children}
        </Text>
      </View>
    </View>
  );
}
