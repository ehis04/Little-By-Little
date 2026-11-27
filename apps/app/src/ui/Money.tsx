import { copy } from '@/copy/en-IE';

import { formatMoney, moneyToWords, UNKNOWN } from './format';
import { Text, type TextTone, type TextVariant } from './Text';

type Props = {
  /** Integer cents. `null` or `undefined` means unknown and is shown as a dash, never as zero. */
  cents: number | null | undefined;
  signed?: boolean;
  variant?: TextVariant;
  tone?: TextTone;
  testID?: string;
};

/** Integer cents as €4.20 with tabular figures. Screen readers hear "four euro twenty". */
export function Money({ cents, signed = false, variant = 'body', tone = 'default', testID }: Props) {
  if (cents === null || cents === undefined) {
    return (
      <Text testID={testID} variant={variant} tone="tertiary" accessibilityLabel={copy.ui.unknownPrice} tabular>
        {UNKNOWN}
      </Text>
    );
  }
  return (
    <Text
      testID={testID}
      variant={variant}
      tone={tone}
      tabular
      accessibilityLabel={moneyToWords(cents, { signed })}
    >
      {formatMoney(cents, { signed })}
    </Text>
  );
}
