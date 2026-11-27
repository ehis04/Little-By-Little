import { TriangleAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { sizes } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { Button } from './Button';
import { Text } from './Text';

type Props = {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
  testID?: string;
};

/** Something failed. Says what, keeps the tone calm, and offers a retry. */
export function ErrorState({
  title = copy.errors.stateTitle,
  body = copy.errors.stateBody,
  onRetry,
  retryLabel = copy.errors.retry,
  testID,
}: Props) {
  const { colours } = useTheme();
  return (
    <View testID={testID} accessibilityRole="alert" className="gap-2 rounded-lg bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <TriangleAlert size={sizes.iconLarge} strokeWidth={sizes.iconStroke} color={colours.danger} />
        <Text accessibilityRole="header" variant="headline" className="flex-1">
          {title}
        </Text>
      </View>
      <Text tone="secondary">{body}</Text>
      {onRetry ? <Button variant="secondary" label={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}
