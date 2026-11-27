import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { sizes, touchTarget } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { haptics } from './haptics';
import { Text } from './Text';
import { useFocusRing } from './useFocusRing';

type Props = {
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
  trailing?: ReactNode;
  testID?: string;
};

/** In-store row: at least 56 tall, the whole row is the tap target, light haptic on check-off. */
export function CheckRow({ title, subtitle, checked, onToggle, trailing, testID }: Props) {
  const { colours } = useTheme();
  const ring = useFocusRing();
  return (
    <Pressable
      {...ring.handlers}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityState={{ checked }}
      onPress={() => {
        if (!checked) haptics.light();
        onToggle(!checked);
      }}
      className="flex-row items-center gap-3 py-2"
      style={[{ minHeight: touchTarget.large }, ring.style]}
    >
      <View
        className={`items-center justify-center rounded-sm border-2 ${checked ? 'border-primary bg-primary' : 'border-border-strong bg-surface'}`}
        style={{ width: sizes.checkBox, height: sizes.checkBox }}
      >
        {checked ? <Check size={sizes.icon} strokeWidth={sizes.iconStroke} color={colours.onPrimary} /> : null}
      </View>
      <View className="flex-1">
        <Text variant="bodyStrong" tone={checked ? 'tertiary' : 'default'} style={checked ? { textDecorationLine: 'line-through' } : undefined} dense>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="callout" tone="secondary" dense>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </Pressable>
  );
}
