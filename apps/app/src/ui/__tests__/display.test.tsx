import { fireEvent, screen } from '@testing-library/react-native';

import { Badge } from '../Badge';
import { Banner } from '../Banner';
import { ConfidenceDot } from '../ConfidenceDot';
import { Duration } from '../Duration';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { Money } from '../Money';
import { ProgressBar } from '../ProgressBar';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { renderUi } from '@/test-utils/renderUi';

describe('Text', () => {
  it('renders the text and can cap font scaling on dense rows', async () => {
    await renderUi(
      <>
        <Text>Plain</Text>
        <Text dense>Dense</Text>
      </>,
    );
    expect(screen.getByText('Dense').props.maxFontSizeMultiplier).toBe(1.6);
    expect(screen.getByText('Plain').props.maxFontSizeMultiplier).toBeUndefined();
  });

  it('uses tabular figures when asked', async () => {
    await renderUi(<Text tabular>4.20</Text>);
    expect(screen.getByText('4.20')).toHaveStyle({ fontVariant: ['tabular-nums'] });
  });
});

describe('Money', () => {
  it('shows €4.20 and announces words', async () => {
    await renderUi(<Money cents={420} />);
    expect(screen.getByText('€4.20')).toBeTruthy();
    expect(screen.getByLabelText('four euro twenty')).toBeTruthy();
  });

  it('shows a signed saving', async () => {
    await renderUi(<Money cents={-150} signed />);
    expect(screen.getByText('-€1.50')).toBeTruthy();
    expect(screen.getByLabelText('minus one euro fifty')).toBeTruthy();
  });

  it('shows unknown as a dash, never zero', async () => {
    await renderUi(<Money cents={null} />);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByLabelText('Price not known')).toBeTruthy();
    expect(screen.queryByText('€0.00')).toBeNull();
  });
});

describe('Duration', () => {
  it('formats and announces', async () => {
    await renderUi(<Duration seconds={70 * 60} />);
    expect(screen.getByText('1 h 10 min')).toBeTruthy();
    expect(screen.getByLabelText('1 hour 10 minutes')).toBeTruthy();
  });

  it('shows unknown as a dash', async () => {
    await renderUi(<Duration seconds={undefined} />);
    expect(screen.getByLabelText('Time not known')).toBeTruthy();
  });
});

describe('ConfidenceDot', () => {
  it.each([
    ['high', 'High confidence'],
    ['medium', 'Medium confidence'],
    ['low', 'Low confidence'],
  ] as const)('%s has a text label for screen readers', async (level, label) => {
    await renderUi(<ConfidenceDot level={level} />);
    expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.queryByText(label)).toBeNull();
  });

  it('can show the label too', async () => {
    await renderUi(<ConfidenceDot level="low" showLabel />);
    expect(screen.getByText('Low confidence')).toBeTruthy();
  });
});

describe('Badge', () => {
  it('says its label', async () => {
    await renderUi(<Badge label="Cheapest" tone="accent" />);
    expect(screen.getByLabelText('Cheapest')).toBeTruthy();
    expect(screen.getByText('Cheapest')).toBeTruthy();
  });
});

describe('Banner', () => {
  it.each([
    ['info', 'Note', 'summary'],
    ['warning', 'Heads up', 'alert'],
    ['offline', 'Offline', 'alert'],
    ['honesty', 'How we work this out', 'summary'],
  ] as const)('%s carries a title and text, not just colour', async (variant, title, role) => {
    await renderUi(<Banner variant={variant}>Body text</Banner>);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText('Body text')).toBeTruthy();
    expect(screen.getByRole(role)).toBeTruthy();
  });
});

describe('ProgressBar', () => {
  it('exposes its value and clamps', async () => {
    await renderUi(
      <>
        <ProgressBar value={0.4} label="Voucher progress" />
        <ProgressBar value={3} label="Over" />
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Voucher progress' })).toHaveAccessibilityValue({ now: 40, min: 0, max: 100 });
    expect(screen.getByRole('progressbar', { name: 'Over' })).toHaveAccessibilityValue({ now: 100 });
  });
});

describe('Skeleton', () => {
  it('is announced as loading', async () => {
    await renderUi(<Skeleton testID="skeleton" />);
    expect(screen.getByLabelText('Loading')).toBeBusy();
  });
});

describe('EmptyState and ErrorState', () => {
  it('EmptyState shows title, body and an optional action', async () => {
    const onAction = jest.fn();
    await renderUi(<EmptyState title="Nothing here" body="Add something" actionLabel="Add" onAction={onAction} />);
    expect(screen.getByRole('header', { name: 'Nothing here' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }));
    expect(onAction).toHaveBeenCalled();
  });

  it('ErrorState is an alert with a retry', async () => {
    const onRetry = jest.fn();
    await renderUi(<ErrorState onRetry={onRetry} />);
    expect(screen.getByRole('header', { name: 'We could not load this' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
