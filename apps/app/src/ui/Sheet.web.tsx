import { X } from 'lucide-react-native';
import { useEffect, useRef, type ComponentRef } from 'react';
import { Modal, View } from 'react-native';

import { copy } from '@/copy/en-IE';
import { ThemeScope } from '@/theme/ThemeProvider';

import { IconButton } from './IconButton';
import { Scrim } from './Scrim';
import type { SheetProps } from './Sheet.types';
import { Text } from './Text';
import { useElevation } from './useElevation';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Centred dialog on the web with a focus trap: focus moves in on open, Tab cycles inside, Escape closes,
 * and focus returns to whatever opened it.
 */
export function Sheet({ visible, onClose, title, children, testID }: SheetProps) {
  const shadow = useElevation('e2');
  const panel = useRef<ComponentRef<typeof View>>(null);

  useEffect(() => {
    if (!visible || typeof document === 'undefined') return;
    const opener = document.activeElement as HTMLElement | null;
    const node = panel.current as unknown as HTMLElement | null;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0] as HTMLElement;
      const lastItem = items[items.length - 1] as HTMLElement;
      const active = document.activeElement;
      if (event.shiftKey && (active === firstItem || !node.contains(active))) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && (active === lastItem || !node.contains(active))) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      opener?.focus?.();
    };
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <ThemeScope>
        <View className="flex-1 items-center justify-center p-5" testID={testID}>
          <Scrim onPress={onClose} />
          <View
            ref={panel}
            role="dialog"
            aria-modal
            aria-label={title}
            className="w-full max-w-md rounded-xl bg-surface p-5 gap-3"
            style={shadow}
          >
            <View className="flex-row items-center justify-between">
              <Text variant="headline" accessibilityRole="header" className="flex-1">
                {title}
              </Text>
              <IconButton icon={X} accessibilityLabel={copy.ui.close} onPress={onClose} />
            </View>
            {children}
          </View>
        </View>
      </ThemeScope>
    </Modal>
  );
}
