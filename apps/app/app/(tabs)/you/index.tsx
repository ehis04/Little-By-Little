import { Text } from 'react-native';

import { copy } from '@/copy/en-IE';
import { EmptyState } from '@/ui/EmptyState';
import { ScreenContainer } from '@/ui/ScreenContainer';

export default function YouScreen() {
  return (
    <ScreenContainer>
      <Text accessibilityRole="header" className="font-semibold text-title text-text">
        {copy.you.title}
      </Text>
      <EmptyState title={copy.you.emptyTitle} body={copy.you.emptyBody} />
    </ScreenContainer>
  );
}
