import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { sizes, touchTarget } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';
import { useFocusRing } from './useFocusRing';

export type ChainIndex = 1 | 2 | 3 | 4 | 5;

type Props = {
  label: string;
  /** Selectable when given; static otherwise. */
  onPress?: () => void;
  selected?: boolean;
  /** Neutral chain chip. Never a retailer colour. */
  chain?: ChainIndex;
  testID?: string;
};

const chainClass: Record<ChainIndex, string> = {
  1: 'bg-chain-1',
  2: 'bg-chain-2',
  3: 'bg-chain-3',
  4: 'bg-chain-4',
  5: 'bg-chain-5',
};

/** Selected state adds a check mark so colour is never the only signal. */
export function Chip({ label, onPress, selected = false, chain, testID }: Props) {
  const { colours } = useTheme();
  const ring = useFocusRing();
  const background = selected ? 'bg-primary' : chain ? chainClass[chain] : 'bg-surface-muted';
  const body = (
    <View className={`flex-row items-center gap-1 rounded-sm px-3 py-1 ${background}`}>
      {selected ? <Check size={sizes.iconSmall} strokeWidth={sizes.iconStroke} color={colours.onPrimary} /> : null}
      <Text variant="caption" tone={selected ? 'onPrimary' : 'default'} dense>
        {label}
      </Text>
    </View>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessibilityLabel={label} accessible>
        {body}
      </View>
    );
  }
  // The visible chip is compact; the pressable wrapper supplies the 44 pt hit area.
  return (
    <Pressable
      {...ring.handlers}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={selected ? `${label}, ${copy.ui.selected}` : label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="justify-center"
      style={[{ minHeight: touchTarget.min }, ring.style]}
    >
      {body}
    </Pressable>
  );
}
