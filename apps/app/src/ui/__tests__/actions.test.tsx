import { fireEvent, screen } from '@testing-library/react-native';
import { Bell } from 'lucide-react-native';

import { Button } from '../Button';
import { Card } from '../Card';
import { CheckRow } from '../CheckRow';
import { Chip } from '../Chip';
import { IconButton } from '../IconButton';
import { ListRow } from '../ListRow';
import { SegmentedControl } from '../SegmentedControl';
import { Text } from '../Text';
import { renderUi } from '@/test-utils/renderUi';

jest.mock('../haptics', () => ({ haptics: { selection: jest.fn(), light: jest.fn(), success: jest.fn() } }));
// eslint-disable-next-line import/first
import { haptics } from '../haptics';

describe('Button', () => {
  it('has a button role, a label and calls onPress', async () => {
    const onPress = jest.fn();
    await renderUi(<Button label="Save" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is at least 48 tall (md) and 56 tall (lg)', async () => {
    await renderUi(
      <>
        <Button label="Medium" onPress={jest.fn()} />
        <Button label="Large" size="lg" onPress={jest.fn()} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveStyle({ minHeight: 48 });
    expect(screen.getByRole('button', { name: 'Large' })).toHaveStyle({ minHeight: 56 });
  });

  it('ignores presses and reports busy while loading, but keeps its label', async () => {
    const onPress = jest.fn();
    await renderUi(<Button label="Save" loading onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Save' });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('is disabled when disabled', async () => {
    const onPress = jest.fn();
    await renderUi(<Button label="Save" disabled onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('uses its label and a 44 x 44 hit area', async () => {
    const onPress = jest.fn();
    await renderUi(<IconButton icon={Bell} accessibilityLabel="Notifications" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Notifications' });
    expect(button).toHaveStyle({ width: 44, height: 44 });
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('Card', () => {
  it('is a button only when pressable', async () => {
    const onPress = jest.fn();
    await renderUi(
      <>
        <Card>
          <Text>static</Text>
        </Card>
        <Card onPress={onPress} accessibilityLabel="Open shop">
          <Text>pressable</Text>
        </Card>
      </>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Open shop' }));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('Chip', () => {
  it('is static without onPress and selectable with it', async () => {
    const onPress = jest.fn();
    await renderUi(
      <>
        <Chip label="Static" chain={2} />
        <Chip label="Pick" onPress={onPress} selected />
      </>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
    const pick = screen.getByRole('button', { name: 'Pick, Selected' });
    expect(pick).toBeSelected();
    expect(pick).toHaveStyle({ minHeight: 44 });
    await fireEvent.press(pick);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('ListRow', () => {
  it('renders title, subtitle and slots, and is pressable with a 48 minimum', async () => {
    const onPress = jest.fn();
    await renderUi(<ListRow title="Milk" subtitle="2 litres" leading={null} trailing={null} onPress={onPress} />);
    const row = screen.getByRole('button', { name: 'Milk, 2 litres' });
    expect(row).toHaveStyle({ minHeight: 48 });
    await fireEvent.press(row);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('CheckRow', () => {
  it('is a 56 tall checkbox, toggles, and gives a haptic on check-off only', async () => {
    const onToggle = jest.fn();
    const { rerender } = await renderUi(<CheckRow title="Milk" checked={false} onToggle={onToggle} />);
    const row = screen.getByRole('checkbox', { name: 'Milk' });
    expect(row).toHaveStyle({ minHeight: 56 });
    expect(row).not.toBeChecked();
    await fireEvent.press(row);
    expect(onToggle).toHaveBeenLastCalledWith(true);
    expect(haptics.light).toHaveBeenCalledTimes(1);

    await rerender(<CheckRow title="Milk" checked onToggle={onToggle} />);
    expect(screen.getByRole('checkbox', { name: 'Milk' })).toBeChecked();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Milk' }));
    expect(onToggle).toHaveBeenLastCalledWith(false);
    expect(haptics.light).toHaveBeenCalledTimes(1);
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'money', label: 'Money' },
    { value: 'time', label: 'Time' },
  ] as const;

  it('marks the selected segment, changes on press and ignores the current one', async () => {
    const onChange = jest.fn();
    await renderUi(<SegmentedControl options={options} value="money" onChange={onChange} label="Optimise for" />);
    expect(screen.getByLabelText('Optimise for')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Money' })).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Time' })).not.toBeSelected();
    expect(screen.getByRole('radio', { name: 'Time' })).toHaveStyle({ minHeight: 44 });
    await fireEvent.press(screen.getByRole('radio', { name: 'Money' }));
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('radio', { name: 'Time' }));
    expect(onChange).toHaveBeenCalledWith('time');
    expect(haptics.selection).toHaveBeenCalledTimes(1);
  });
});
