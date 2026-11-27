import { Text } from 'react-native';

import { copy } from '@/copy/en-IE';
import { EmptyState } from '@/ui/EmptyState';
import { ScreenContainer } from '@/ui/ScreenContainer';

export default function ListScreen() {
  return (
    <ScreenContainer>
      <Text accessibilityRole="header" className="font-semibold text-title text-text">
        {copy.list.title}
      </Text>
      <EmptyState title={copy.list.emptyTitle} body={copy.list.emptyBody} />
    </ScreenContainer>
  );
}
