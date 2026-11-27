import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme/tokens';

import { useElevation } from './useElevation';

type Props = { children: ReactNode; testID?: string };

/**
 * Bottom-pinned primary action with safe-area padding and a top hairline. Place it as the last child of a
 * full-height column (the screen body above it scrolls), so it stays pinned without overlapping content.
 */
export function StickyActionBar({ children, testID }: Props) {
  const insets = useSafeAreaInsets();
  const shadow = useElevation('e2');
  return (
    <View testID={testID} className="border-t border-border bg-surface px-5 pt-3" style={[shadow, { paddingBottom: insets.bottom + spacing[3] }]}>
      <View className="w-full max-w-content self-center">{children}</View>
    </View>
  );
}
