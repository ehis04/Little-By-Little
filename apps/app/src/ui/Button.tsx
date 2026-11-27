import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { opacity, sizes, touchTarget } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { Text, type TextTone } from './Text';
import { useFocusRing } from './useFocusRing';
import { usePressed } from './usePressed';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  /** Stretch to the full width of the parent. */
  fullWidth?: boolean;
};

const container: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-border-strong',
  ghost: 'bg-transparent',
  destructive: 'bg-danger',
};
const tone: Record<ButtonVariant, TextTone> = {
  primary: 'onPrimary',
  secondary: 'default',
  ghost: 'primary',
  destructive: 'onPrimary',
};

/** md is 48 tall, lg is 56. Loading keeps the width by hiding the label rather than removing it. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  accessibilityLabel,
  accessibilityHint,
  testID,
  fullWidth = false,
}: Props) {
  const { colours } = useTheme();
  const ring = useFocusRing();
  const { pressed, handlers: pressHandlers } = usePressed();
  const inactive = disabled || loading;
  const iconColour = variant === 'primary' || variant === 'destructive' ? colours.onPrimary
    : variant === 'ghost' ? colours.primary : colours.text;

  return (
    <Pressable
      {...ring.handlers}
      {...pressHandlers}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={`items-center justify-center rounded-md px-5 ${container[variant]} ${fullWidth ? 'self-stretch' : 'self-start'}`}
      style={[
        { minHeight: size === 'lg' ? touchTarget.large : touchTarget.button, minWidth: touchTarget.button },
        { opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1 },
        ring.style,
      ]}
    >
      <View className="flex-row items-center justify-center gap-2" style={{ opacity: loading ? opacity.hidden : 1 }}>
        {Icon ? <Icon size={sizes.icon} strokeWidth={sizes.iconStroke} color={iconColour} /> : null}
        <Text variant="bodyStrong" tone={tone[variant]}>
          {label}
        </Text>
      </View>
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color={iconColour} accessibilityLabel={copy.ui.loading} />
        </View>
      ) : null}
    </Pressable>
  );
}
