import { Text, View } from 'react-native';

type Props = { title: string; body: string };

export function EmptyState({ title, body }: Props) {
  return (
    <View className="rounded-lg bg-surface p-4 gap-2" accessibilityRole="summary">
      <Text accessibilityRole="header" className="font-semibold text-headline text-text">
        {title}
      </Text>
      <Text className="font-regular text-body text-text-secondary">{body}</Text>
    </View>
  );
}
