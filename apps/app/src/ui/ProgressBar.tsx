import { View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { radius } from '@/theme/tokens';

import { Text } from './Text';

type Props = {
  /** Fraction from 0 to 1. Values outside are clamped. */
  value: number;
  /** What is progressing, for example "Voucher progress". */
  label: string;
  /** Optional visible caption such as "€12 to go". */
  caption?: string;
  testID?: string;
};

const BAR_HEIGHT = 8;

export function ProgressBar({ value, label, caption, testID }: Props) {
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: copy.ui.progress(percent) }}
      className="gap-1"
    >
      <View className="overflow-hidden bg-surface-muted" style={{ height: BAR_HEIGHT, borderRadius: radius.full }}>
        <View className="h-full bg-primary" style={{ width: `${percent}%`, borderRadius: radius.full }} />
      </View>
      {caption ? (
        <Text variant="caption" tone="secondary">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
