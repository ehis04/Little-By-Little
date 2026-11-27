import { useEffect } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';
import { useElevation } from './useElevation';

export const SNACKBAR_DURATION_MS = 4000;

type Props = {
  visible: boolean;
  message: string;
  /** Undo after delete. */
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  durationMs?: number;
  testID?: string;
};

/** Auto-dismisses after 4 s and is announced to screen readers when it appears. */
export function Snackbar({ visible, message, actionLabel, onAction, onDismiss, durationMs = SNACKBAR_DURATION_MS, testID }: Props) {
  const shadow = useElevation('e2');

  useEffect(() => {
    if (!visible) return;
    if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [visible, message, durationMs, onDismiss]);

  if (!visible) return null;
  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="flex-row items-center justify-between gap-3 self-stretch rounded-md border border-border bg-surface px-4 py-2"
      style={shadow}
    >
      <Text className="flex-1">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button
          variant="ghost"
          label={actionLabel}
          onPress={() => {
            onAction();
            onDismiss();
          }}
        />
      ) : null}
    </View>
  );
}
