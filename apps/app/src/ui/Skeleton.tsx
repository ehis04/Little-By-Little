import { useEffect, useState } from 'react';
import { Animated, Platform, View, type DimensionValue } from 'react-native';

import { copy } from '@/copy/en-IE';
import { motion, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { useReduceMotion } from './useReduceMotion';

type Props = { width?: DimensionValue; height?: number; testID?: string };

const SKELETON_HEIGHT = 16;
const PULSE_LOW = 0.5;

/** Loading placeholder. Pulses (opacity only); static when Reduce Motion is on. */
export function Skeleton({ width = '100%', height = SKELETON_HEIGHT, testID }: Props) {
  const reduceMotion = useReduceMotion();
  const { colours } = useTheme();
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: PULSE_LOW, duration: motion.slow * 2, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 1, duration: motion.slow * 2, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, pulse]);

  return (
    <View testID={testID} accessible accessibilityLabel={copy.ui.loading} accessibilityState={{ busy: true }}>
      <Animated.View
        style={{
          width,
          height,
          borderRadius: radius.sm,
          backgroundColor: colours.surfaceMuted,
          opacity: reduceMotion ? 1 : pulse,
        }}
      />
    </View>
  );
}
