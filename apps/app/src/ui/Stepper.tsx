import { Minus, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { opacity, sizes, touchTarget } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { haptics } from './haptics';
import { Text } from './Text';
import { useFocusRing } from './useFocusRing';

export const REPEAT_INTERVAL_MS = 150;

type Props = {
  value: number;
  onChange: (next: number) => void;
  /** Names what is being counted, for example "Milk quantity". Announced with the value. */
  label: string;
  min?: number;
  max?: number;
  step?: number;
  testID?: string;
};

function StepButton({
  icon: Icon,
  label,
  disabled,
  onPress,
  onLongPress,
  onPressOut,
  testID,
}: {
  icon: typeof Plus;
  label: string;
  disabled: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onPressOut: () => void;
  testID: string;
}) {
  const { colours } = useTheme();
  const ring = useFocusRing();
  return (
    <Pressable
      {...ring.handlers}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      className="items-center justify-center rounded-full bg-surface-muted"
      style={[
        { width: touchTarget.min, height: touchTarget.min, opacity: disabled ? opacity.disabled : 1 },
        ring.style,
      ]}
    >
      <Icon size={sizes.icon} strokeWidth={sizes.iconStroke} color={colours.text} />
    </Pressable>
  );
}

/** Quantity control. Long press repeats; each change gives a selection haptic. Announces its value. */
export function Stepper({ value, onChange, label, min = 0, max = 99, step = 1, testID }: Props) {
  const valueRef = useRef(value);
  const propValue = useRef(value);
  useEffect(() => {
    propValue.current = value;
    valueRef.current = value;
  }, [value]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    // A controlled parent may have refused the last change: go back to what it shows.
    valueRef.current = propValue.current;
  }, []);
  useEffect(() => stop, [stop]);

  const change = useCallback(
    (direction: 1 | -1, from: number = valueRef.current) => {
      const next = Math.min(max, Math.max(min, from + direction * step));
      if (next === from) {
        stop();
        return;
      }
      valueRef.current = next;
      haptics.selection();
      onChange(next);
    },
    [max, min, step, onChange, stop],
  );

  const startRepeat = (direction: 1 | -1) => {
    stop();
    change(direction, value);
    timer.current = setInterval(() => change(direction), REPEAT_INTERVAL_MS);
  };

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: String(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') change(1, value);
        if (e.nativeEvent.actionName === 'decrement') change(-1, value);
      }}
      className="flex-row items-center gap-2"
    >
      <StepButton
        icon={Minus}
        label={copy.ui.decrease}
        testID={testID ? `${testID}-decrease` : 'stepper-decrease'}
        disabled={value <= min}
        onPress={() => change(-1, value)}
        onLongPress={() => startRepeat(-1)}
        onPressOut={stop}
      />
      <View className="min-w-10 items-center">
        <Text variant="bodyStrong" tabular>
          {value}
        </Text>
      </View>
      <StepButton
        icon={Plus}
        label={copy.ui.increase}
        testID={testID ? `${testID}-increase` : 'stepper-increase'}
        disabled={value >= max}
        onPress={() => change(1, value)}
        onLongPress={() => startRepeat(1)}
        onPressOut={stop}
      />
    </View>
  );
}
