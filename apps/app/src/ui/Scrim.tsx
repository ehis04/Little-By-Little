import { Pressable } from 'react-native';

import { copy } from '@/copy/en-IE';
import { useTheme } from '@/theme/ThemeProvider';

const SCRIM_OPACITY = 0.5;

/** Dimmed backdrop behind a sheet. Dark in both schemes, and a tap on it closes. */
export function Scrim({ onPress }: { onPress: () => void }) {
  const { scheme, colours } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copy.ui.close}
      onPress={onPress}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: scheme === 'dark' ? colours.bg : colours.text,
        opacity: SCRIM_OPACITY,
      }}
    />
  );
}
