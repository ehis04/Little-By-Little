import { Link } from 'expo-router';

import { copy } from '@/copy/en-IE';
import { EmptyState } from '@/ui/EmptyState';
import { ScreenContainer } from '@/ui/ScreenContainer';
import { Text } from '@/ui/Text';

export default function YouScreen() {
  return (
    <ScreenContainer>
      <Text accessibilityRole="header" variant="title">
        {copy.you.title}
      </Text>
      <EmptyState title={copy.you.emptyTitle} body={copy.you.emptyBody} />
      {__DEV__ ? (
        <Link href="/gallery" accessibilityRole="link">
          <Text tone="primary">{copy.gallery.openLink}</Text>
        </Link>
      ) : null}
    </ScreenContainer>
  );
}
