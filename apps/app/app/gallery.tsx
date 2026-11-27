import { Redirect } from 'expo-router';
import { Bell, Trash2, X } from 'lucide-react-native';
import { useCallback, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { copy } from '@/copy/en-IE';
import {
  Badge,
  Banner,
  Button,
  Card,
  CheckRow,
  Chip,
  ConfidenceDot,
  Duration,
  EmptyState,
  ErrorState,
  IconButton,
  ListRow,
  Money,
  ProgressBar,
  ScreenContainer,
  SegmentedControl,
  Sheet,
  Skeleton,
  Snackbar,
  Stepper,
  StickyActionBar,
  Text,
} from '@/ui';

const g = copy.gallery;
const noop = () => undefined;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 pt-4">
      <Text variant="headline" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-3">{children}</View>;
}

type Mode = 'money' | 'balanced' | 'time';

/** Development-only UI gallery: every component in every state. Redirects away in production builds. */
export default function GalleryScreen() {
  const [quantity, setQuantity] = useState(2);
  const [checked, setChecked] = useState(false);
  const [selectedChip, setSelectedChip] = useState(true);
  const [mode, setMode] = useState<Mode>('balanced');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const dismissSnackbar = useCallback(() => setSnackbarOpen(false), []);

  if (!__DEV__) return <Redirect href="/" />;

  const modes = [
    { value: 'money' as const, label: g.sample.mode.money },
    { value: 'balanced' as const, label: g.sample.mode.balanced },
    { value: 'time' as const, label: g.sample.mode.time },
  ];

  return (
    <View className="flex-1 bg-bg">
      <ScreenContainer>
        <Text variant="title" accessibilityRole="header">
          {g.title}
        </Text>
        <Text tone="secondary">{g.intro}</Text>

        <Section title={g.sections.type}>
          <Text variant="display">Display</Text>
          <Text variant="title">Title</Text>
          <Text variant="headline">Headline</Text>
          <Text variant="body">Body</Text>
          <Text variant="bodyStrong">Body strong</Text>
          <Text variant="callout">Callout</Text>
          <Text variant="caption">Caption</Text>
          <Row>
            <Text tone="secondary">Secondary</Text>
            <Text tone="tertiary">Tertiary</Text>
            <Text tone="primary">Primary</Text>
            <Text tone="accent">Accent</Text>
            <Text tone="positive">Positive</Text>
            <Text tone="warning">Warning</Text>
            <Text tone="danger">Danger</Text>
            <Text tone="info">Info</Text>
          </Row>
        </Section>

        <Section title={g.sections.buttons}>
          <Row>
            <Button label="Primary" onPress={noop} />
            <Button label="Secondary" variant="secondary" onPress={noop} />
            <Button label="Ghost" variant="ghost" onPress={noop} />
            <Button label="Destructive" variant="destructive" icon={Trash2} onPress={noop} />
          </Row>
          <Row>
            <Button label="Large" size="lg" onPress={noop} />
            <Button label="Loading" loading onPress={noop} />
            <Button label="Disabled" disabled onPress={noop} />
            <Button label="Disabled secondary" variant="secondary" disabled onPress={noop} />
          </Row>
        </Section>

        <Section title={g.sections.iconButtons}>
          <Row>
            <IconButton icon={Bell} accessibilityLabel="Notifications" onPress={noop} />
            <IconButton icon={X} accessibilityLabel={copy.ui.close} onPress={noop} />
            <IconButton icon={Trash2} accessibilityLabel="Delete" disabled onPress={noop} />
          </Row>
        </Section>

        <Section title={g.sections.cards}>
          <Card>
            <Text variant="bodyStrong">Static card</Text>
            <Text variant="callout" tone="secondary">{g.sample.shop}</Text>
          </Card>
          <Card onPress={noop} accessibilityLabel={g.sample.shop}>
            <Text variant="bodyStrong">Pressable card</Text>
            <Text variant="callout" tone="secondary">{g.sample.shop}</Text>
          </Card>
        </Section>

        <Section title={g.sections.chips}>
          <Row>
            <Chip label={g.sample.chain[0]} chain={1} />
            <Chip label={g.sample.chain[1]} chain={2} />
            <Chip label={g.sample.chain[2]} chain={3} />
            <Chip label={g.sample.chain[3]} chain={4} />
            <Chip label={g.sample.chain[4]} chain={5} />
          </Row>
          <Row>
            <Chip label="Static" />
            <Chip label="Selectable" onPress={() => setSelectedChip((v) => !v)} selected={selectedChip} />
            <Chip label="Not selected" onPress={noop} />
          </Row>
        </Section>

        <Section title={g.sections.badges}>
          <Row>
            <Badge label={g.sample.option.cheapest} tone="accent" />
            <Badge label={g.sample.option.balanced} tone="primary" />
            <Badge label={g.sample.option.fastest} tone="info" />
            <Badge label={g.sample.match.exact} tone="neutral" />
            <Badge label={g.sample.match.similar} tone="warning" />
          </Row>
        </Section>

        <Section title={g.sections.stepper}>
          <Row>
            <Stepper value={quantity} onChange={setQuantity} label={`${g.sample.milk} quantity`} min={0} max={10} />
            <Stepper value={0} onChange={noop} label="At minimum" min={0} max={10} />
            <Stepper value={10} onChange={noop} label="At maximum" min={0} max={10} />
          </Row>
        </Section>

        <Section title={g.sections.rows}>
          <Card>
            <ListRow title={g.sample.milk} subtitle={g.sample.milkMeta} trailing={<Money cents={189} />} />
            <ListRow title={g.sample.milk} subtitle={g.sample.milkMeta} trailing={<Money cents={null} />} onPress={noop} />
          </Card>
        </Section>

        <Section title={g.sections.checkRows}>
          <Card>
            <CheckRow title={g.sample.milk} subtitle={g.sample.milkMeta} checked={checked} onToggle={setChecked} trailing={<Money cents={189} />} />
            <CheckRow title={g.sample.milk} checked onToggle={noop} />
          </Card>
        </Section>

        <Section title={g.sections.sheet}>
          <Row>
            <Button label={g.sample.openSheet} variant="secondary" onPress={() => setSheetOpen(true)} />
          </Row>
          <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title={g.sample.sheetTitle}>
            <Text tone="secondary">{g.sample.sheetBody}</Text>
            <Button label={copy.ui.close} onPress={() => setSheetOpen(false)} />
          </Sheet>
        </Section>

        <Section title={g.sections.skeleton}>
          <Card>
            <View className="gap-2">
              <Skeleton width="60%" />
              <Skeleton />
              <Skeleton width="80%" />
            </View>
          </Card>
        </Section>

        <Section title={g.sections.banners}>
          <Banner variant="info">{g.sample.infoBody}</Banner>
          <Banner variant="warning">{g.sample.bannerBody}</Banner>
          <Banner variant="offline">{g.sample.offlineBody}</Banner>
          <Banner variant="honesty">{g.sample.honestyBody}</Banner>
        </Section>

        <Section title={g.sections.progress}>
          <ProgressBar value={0} label={g.sample.vouchers} caption="0%" />
          <ProgressBar value={0.4} label={g.sample.vouchers} caption="40%" />
          <ProgressBar value={1} label={g.sample.vouchers} caption="100%" />
        </Section>

        <Section title={g.sections.segmented}>
          <SegmentedControl options={modes} value={mode} onChange={setMode} label="Optimise for" />
        </Section>

        <Section title={g.sections.money}>
          <Row>
            <Money cents={420} />
            <Money cents={0} />
            <Money cents={-150} signed tone="positive" />
            <Money cents={250} signed />
            <Money cents={1234567} variant="display" />
            <Money cents={null} />
          </Row>
        </Section>

        <Section title={g.sections.duration}>
          <Row>
            <Duration seconds={55 * 60} />
            <Duration seconds={70 * 60} />
            <Duration seconds={2 * 3600} />
            <Duration seconds={null} />
          </Row>
        </Section>

        <Section title={g.sections.confidence}>
          <Row>
            <ConfidenceDot level="high" showLabel />
            <ConfidenceDot level="medium" showLabel />
            <ConfidenceDot level="low" showLabel />
            <ConfidenceDot level="high" />
          </Row>
        </Section>

        <Section title={g.sections.states}>
          <EmptyState title={copy.list.emptyTitle} body={copy.list.emptyBody} actionLabel={g.sample.undo} onAction={noop} />
          <ErrorState onRetry={noop} />
        </Section>

        <Section title={g.sections.snackbar}>
          <Row>
            <Button label={g.sample.showSnackbar} variant="secondary" icon={Trash2} onPress={() => setSnackbarOpen(true)} />
          </Row>
          <Snackbar
            visible={snackbarOpen}
            message={g.sample.snackbarMessage}
            actionLabel={g.sample.undo}
            onAction={noop}
            onDismiss={dismissSnackbar}
          />
        </Section>

        <Section title={g.sections.actionBar}>
          <Text tone="secondary">{g.sections.actionBar}</Text>
        </Section>
      </ScreenContainer>
      <StickyActionBar>
        <Button label={g.sample.choosePlan} size="lg" fullWidth onPress={noop} />
      </StickyActionBar>
    </View>
  );
}
