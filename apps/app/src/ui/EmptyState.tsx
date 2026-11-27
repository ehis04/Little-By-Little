import { View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';

type Props = { title: string; body: string; actionLabel?: string; onAction?: () => void; testID?: string };

export function EmptyState({ title, body, actionLabel, onAction, testID }: Props) {
  return (
    <View testID={testID} className="rounded-lg bg-surface p-4 gap-2" accessibilityRole="summary">
      <Text accessibilityRole="header" variant="headline">
        {title}
      </Text>
      <Text tone="secondary">{body}</Text>
      {actionLabel && onAction ? <Button variant="secondary" label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
