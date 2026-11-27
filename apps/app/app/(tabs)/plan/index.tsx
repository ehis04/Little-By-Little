import { copy } from '@/copy/en-IE';
import { EmptyState } from '@/ui/EmptyState';
import { ScreenContainer } from '@/ui/ScreenContainer';
import { Text } from '@/ui/Text';

export default function PlanScreen() {
  return (
    <ScreenContainer>
      <Text accessibilityRole="header" variant="title">
        {copy.plan.title}
      </Text>
      <EmptyState title={copy.plan.emptyTitle} body={copy.plan.emptyBody} />
    </ScreenContainer>
  );
}
