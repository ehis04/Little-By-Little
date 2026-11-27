import { X } from 'lucide-react-native';
import { Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { copy } from '@/copy/en-IE';
import { ThemeScope } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

import { IconButton } from './IconButton';
import { Scrim } from './Scrim';
import type { SheetProps } from './Sheet.types';
import { Text } from './Text';
import { useElevation } from './useElevation';
import { useReduceMotion } from './useReduceMotion';

/** Bottom sheet on phones. Slides up; with Reduce Motion it fades instead. */
export function Sheet({ visible, onClose, title, children, testID }: SheetProps) {
  const insets = useSafeAreaInsets();
  const shadow = useElevation('e2');
  const reduceMotion = useReduceMotion();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'fade' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <ThemeScope>
        <View className="flex-1 justify-end" testID={testID}>
          <Scrim onPress={onClose} />
          <View
            accessibilityViewIsModal
            accessibilityLabel={title}
            className="rounded-t-xl bg-surface px-5 pt-4 gap-3"
            style={[shadow, { paddingBottom: insets.bottom + spacing[4] }]}
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
