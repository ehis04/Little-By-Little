import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { opacity } from '@/theme/tokens';

import { useElevation } from './useElevation';
import { useFocusRing } from './useFocusRing';
import { usePressed } from './usePressed';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  /** Required when pressable. */
  accessibilityLabel?: string;
  testID?: string;
};

/** Surface, radius lg, padding 16. Pressable when `onPress` is given. */
export function Card({ children, onPress, accessibilityLabel, testID }: Props) {
  const shadow = useElevation('e1');
  const ring = useFocusRing();
  const { pressed, handlers: pressHandlers } = usePressed();
  if (!onPress) {
    return (
      <View testID={testID} className="rounded-lg bg-surface p-4" style={shadow}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      {...ring.handlers}
      {...pressHandlers}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="rounded-lg bg-surface p-4"
      style={[shadow, { opacity: pressed ? opacity.pressed : 1 }, ring.style]}
    >
      {children}
    </Pressable>
  );
}
