import { Pressable, View } from 'react-native';

import { touchTarget } from '@/theme/tokens';

import { haptics } from './haptics';
import { Text } from './Text';
import { useFocusRing } from './useFocusRing';

export type Segment<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Segment<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Names the group, for example "Optimise for". */
  label: string;
  testID?: string;
};

function Item<T extends string>({ option, selected, onPress }: { option: Segment<T>; selected: boolean; onPress: () => void }) {
  const ring = useFocusRing();
  return (
    <Pressable
      {...ring.handlers}
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      className={`flex-1 items-center justify-center rounded-sm px-2 ${selected ? 'bg-primary' : 'bg-transparent'}`}
      style={[{ minHeight: touchTarget.min }, ring.style]}
    >
      <Text variant="bodyStrong" tone={selected ? 'onPrimary' : 'default'} dense>
        {option.label}
      </Text>
    </Pressable>
  );
}

/** Money / Balanced / Time. The selected segment is filled and announced as selected. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, testID }: Props<T>) {
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      className="flex-row rounded-md bg-surface-muted p-1"
    >
      {options.map((option) => (
        <Item
          key={option.value}
          option={option}
          selected={option.value === value}
          onPress={() => {
            if (option.value === value) return;
            haptics.selection();
            onChange(option.value);
          }}
        />
      ))}
    </View>
  );
}
