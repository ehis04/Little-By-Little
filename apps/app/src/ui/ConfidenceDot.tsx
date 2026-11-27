import { View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { sizes } from '@/theme/tokens';

import { Text } from './Text';

export type Confidence = 'high' | 'medium' | 'low';

type Props = { level: Confidence; showLabel?: boolean; testID?: string };

// Shape differs as well as colour: filled, filled, hollow.
const dot: Record<Confidence, string> = {
  high: 'bg-positive',
  medium: 'bg-warning',
  low: 'border-2 border-danger bg-transparent',
};

export function ConfidenceDot({ level, showLabel = false, testID }: Props) {
  const label = copy.ui.confidence[level];
  return (
    <View testID={testID} accessible accessibilityLabel={label} className="flex-row items-center gap-2">
      <View className={`rounded-full ${dot[level]}`} style={{ width: sizes.dot, height: sizes.dot }} />
      {showLabel ? (
        <Text variant="caption" tone="secondary" dense>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
