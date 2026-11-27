import { View } from 'react-native';

import { Text, type TextTone } from './Text';

export type BadgeTone = 'accent' | 'primary' | 'info' | 'neutral' | 'warning';

type Props = { label: string; tone?: BadgeTone; testID?: string };

// Accent fills carry `text` on top (docs/02 section 5.1); outlined tones keep their own text colour.
const container: Record<BadgeTone, string> = {
  accent: 'bg-accent',
  primary: 'border border-primary bg-surface',
  info: 'border border-info bg-surface',
  neutral: 'bg-surface-muted',
  warning: 'border border-warning bg-surface',
};
const tone: Record<BadgeTone, TextTone> = {
  accent: 'default',
  primary: 'primary',
  info: 'info',
  neutral: 'secondary',
  warning: 'warning',
};

/** Option badges (Cheapest, Balanced, Fastest) and match-level tags. The label always says it. */
export function Badge({ label, tone: t = 'neutral', testID }: Props) {
  return (
    <View testID={testID} accessible accessibilityLabel={label} className={`self-start rounded-sm px-2 py-1 ${container[t]}`}>
      <Text variant="caption" tone={tone[t]} dense>
        {label}
      </Text>
    </View>
  );
}
