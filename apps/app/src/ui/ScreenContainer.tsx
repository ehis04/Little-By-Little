import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { children: ReactNode };

/** Page frame: safe areas, 20 px side padding, content capped at 1120 px on wide web. */
export function ScreenContainer({ children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full max-w-content self-center px-5 py-6 gap-4">{children}</View>
    </ScrollView>
  );
}
