import { Text } from 'react-native';

import { copy } from '@/copy/en-IE';
import { EmptyState } from '@/ui/EmptyState';
import { ScreenContainer } from '@/ui/ScreenContainer';

export default function PlanScreen() {
  return (
    <ScreenContainer>
      <Text accessibilityRole="header" className="font-semibold text-title text-text">
        {copy.plan.title}
      </Text>
      <EmptyState title={copy.plan.emptyTitle} body={copy.plan.emptyBody} />
    </ScreenContainer>
  );
}
