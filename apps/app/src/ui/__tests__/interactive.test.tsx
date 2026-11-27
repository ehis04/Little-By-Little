import { act, fireEvent, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { renderUi } from '@/test-utils/renderUi';

import { Button } from '../Button';
import { Sheet } from '../Sheet';
import { Snackbar, SNACKBAR_DURATION_MS } from '../Snackbar';
import { StickyActionBar } from '../StickyActionBar';
import { REPEAT_INTERVAL_MS, Stepper } from '../Stepper';
import { Text } from '../Text';
import { haptics } from '../haptics';

jest.mock('../haptics', () => ({ haptics: { selection: jest.fn(), light: jest.fn(), success: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe('Stepper', () => {
  it('announces its value and changes by one with a selection haptic', async () => {
    const onChange = jest.fn();
    await renderUi(<Stepper value={2} onChange={onChange} label="Milk quantity" min={0} max={5} />);
    const stepper = screen.getByRole('adjustable', { name: 'Milk quantity' });
    expect(stepper).toHaveAccessibilityValue({ now: 2, min: 0, max: 5 });
    await fireEvent.press(screen.getByRole('button', { name: 'Add one' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await fireEvent.press(screen.getByRole('button', { name: 'Remove one' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(haptics.selection).toHaveBeenCalledTimes(2);
  });

  it('disables at the limits and never goes past them', async () => {
    const onChange = jest.fn();
    const { rerender } = await renderUi(<Stepper value={0} onChange={onChange} label="Qty" min={0} max={3} />);
    expect(screen.getByRole('button', { name: 'Remove one' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Remove one' }));
    expect(onChange).not.toHaveBeenCalled();
    await rerender(<Stepper value={3} onChange={onChange} label="Qty" min={0} max={3} />);
    expect(screen.getByRole('button', { name: 'Add one' })).toBeDisabled();
  });

  it('has 44 x 44 buttons', async () => {
    await renderUi(<Stepper value={1} onChange={jest.fn()} label="Qty" />);
    expect(screen.getByRole('button', { name: 'Add one' })).toHaveStyle({ width: 44, height: 44 });
  });

  it('responds to screen reader increment and decrement actions', async () => {
    const onChange = jest.fn();
    await renderUi(<Stepper value={2} onChange={onChange} label="Qty" />);
    const stepper = screen.getByRole('adjustable', { name: 'Qty' });
    await fireEvent(stepper, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenLastCalledWith(3);
    await fireEvent(stepper, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('repeats on long press until released, stopping at the maximum', async () => {
    jest.useFakeTimers();
    try {
      const onChange = jest.fn();
      function Harness() {
        const [value, setValue] = useState(0);
        return (
          <Stepper
            value={value}
            onChange={(next: number) => {
              onChange(next);
              setValue(next);
            }}
            label="Qty"
            max={4}
          />
        );
      }
      await renderUi(<Harness />);
      const add = screen.getByRole('button', { name: 'Add one' });
      await fireEvent(add, 'longPress');
      await act(async () => {
        jest.advanceTimersByTime(REPEAT_INTERVAL_MS * 2);
      });
      expect(onChange.mock.calls.map((c) => c[0])).toEqual([1, 2, 3]);
      await fireEvent(add, 'pressOut');
      await act(async () => {
        jest.advanceTimersByTime(REPEAT_INTERVAL_MS * 5);
      });
      expect(onChange).toHaveBeenCalledTimes(3);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('Sheet', () => {
  it('shows its title and content and closes from the close button', async () => {
    const onClose = jest.fn();
    await renderUi(
      <Sheet visible onClose={onClose} title="Choose a shop">
        <Text>Body</Text>
      </Sheet>,
    );
    expect(screen.getByText('Choose a shop')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
    const closers = screen.getAllByRole('button', { name: 'Close' });
    await fireEvent.press(closers[closers.length - 1] as (typeof closers)[number]);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when hidden', async () => {
    await renderUi(
      <Sheet visible={false} onClose={jest.fn()} title="Hidden">
        <Text>Body</Text>
      </Sheet>,
    );
    expect(screen.queryByText('Hidden')).toBeNull();
  });
});

describe('Snackbar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('is announced, offers the action and auto-dismisses after 4 seconds', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    const onDismiss = jest.fn();
    await renderUi(<Snackbar visible message="Milk removed" actionLabel="Undo" onAction={jest.fn()} onDismiss={onDismiss} />);
    expect(screen.getByText('Milk removed')).toBeTruthy();
    expect(announce).toHaveBeenCalledWith('Milk removed');
    await act(async () => {
      jest.advanceTimersByTime(SNACKBAR_DURATION_MS - 1);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('runs the action and dismisses', async () => {
    const onAction = jest.fn();
    const onDismiss = jest.fn();
    await renderUi(<Snackbar visible message="Milk removed" actionLabel="Undo" onAction={onAction} onDismiss={onDismiss} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('renders nothing when not visible', async () => {
    await renderUi(<Snackbar visible={false} message="Hidden" onDismiss={jest.fn()} />);
    expect(screen.queryByText('Hidden')).toBeNull();
  });
});

describe('StickyActionBar', () => {
  it('hosts the primary action', async () => {
    const onPress = jest.fn();
    await renderUi(
      <StickyActionBar>
        <Button label="Choose this plan" onPress={onPress} />
      </StickyActionBar>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Choose this plan' }));
    expect(onPress).toHaveBeenCalled();
  });
});
