import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics never block an action: failures and the web are silently ignored (docs/02 section 5.4).
function run(task: () => Promise<void>): void {
  if (Platform.OS === 'web') return;
  task().catch(() => undefined);
}

export const haptics = {
  selection: () => run(() => Haptics.selectionAsync()),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
