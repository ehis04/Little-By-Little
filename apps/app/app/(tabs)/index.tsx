import { copy } from '@/copy/en-IE';
import { EmptyState } from '@/ui/EmptyState';
import { ScreenContainer } from '@/ui/ScreenContainer';
import { Text } from '@/ui/Text';

export default function ListScreen() {
  return (
    <ScreenContainer>
      <Text accessibilityRole="header" variant="title">
        {copy.list.title}
      </Text>
      <EmptyState title={copy.list.emptyTitle} body={copy.list.emptyBody} />
    </ScreenContainer>
  );
}
