import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { opacity, sizes, touchTarget } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { useFocusRing } from './useFocusRing';
import { usePressed } from './usePressed';

type Props = {
  icon: LucideIcon;
  /** Required: an icon alone says nothing to a screen reader. */
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

/** 44 x 44 minimum hit area. */
export function IconButton({ icon: Icon, accessibilityLabel, onPress, disabled = false, testID }: Props) {
  const { colours } = useTheme();
  const ring = useFocusRing();
  const { pressed, handlers: pressHandlers } = usePressed();
  return (
    <Pressable
      {...ring.handlers}
      {...pressHandlers}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="items-center justify-center rounded-full"
      style={[
        { width: touchTarget.min, height: touchTarget.min },
        { opacity: disabled ? opacity.disabled : 1 },
        pressed ? { backgroundColor: colours.surfaceMuted } : null,
        ring.style,
      ]}
    >
      <Icon size={sizes.iconLarge} strokeWidth={sizes.iconStroke} color={colours.text} />
    </Pressable>
  );
}
