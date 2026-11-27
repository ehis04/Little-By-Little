import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { touchTarget } from '@/theme/tokens';

import { Text } from './Text';
import { useFocusRing } from './useFocusRing';

type Props = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

/** Standard row: leading, title and subtitle, trailing. Pressable rows are at least 48 tall. */
export function ListRow({ title, subtitle, leading, trailing, onPress, accessibilityLabel, testID }: Props) {
  const ring = useFocusRing();
  const content = (
    <>
      {leading ? <View>{leading}</View> : null}
      <View className="flex-1">
        <Text variant="bodyStrong" dense>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="callout" tone="secondary" dense>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={accessibilityLabel} className="flex-row items-center gap-3 py-3">
        {content}
      </View>
    );
  }
  return (
    <Pressable
      {...ring.handlers}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
      onPress={onPress}
      className="flex-row items-center gap-3 py-3"
      style={[{ minHeight: touchTarget.button }, ring.style]}
    >
      {content}
    </Pressable>
  );
}
