import { copy } from '@/copy/en-IE';

import { durationToWords, formatDuration, UNKNOWN } from './format';
import { Text, type TextTone, type TextVariant } from './Text';

type Props = {
  /** Integer seconds. `null` or `undefined` means unknown. */
  seconds: number | null | undefined;
  variant?: TextVariant;
  tone?: TextTone;
  testID?: string;
};

/** "55 min" or "1 h 10 min". Screen readers hear the words in full. */
export function Duration({ seconds, variant = 'body', tone = 'default', testID }: Props) {
  if (seconds === null || seconds === undefined) {
    return (
      <Text testID={testID} variant={variant} tone="tertiary" accessibilityLabel={copy.ui.unknownTime} tabular>
        {UNKNOWN}
      </Text>
    );
  }
  return (
    <Text testID={testID} variant={variant} tone={tone} tabular accessibilityLabel={durationToWords(seconds)}>
      {formatDuration(seconds)}
    </Text>
  );
}
