import { useState } from 'react';
import { Platform, type ViewStyle } from 'react-native';

import { focusRing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/** Visible keyboard focus on web: 2 px primary ring, offset 2 (docs/02 section 7). */
export function useFocusRing() {
  const [focused, setFocused] = useState(false);
  const { colours } = useTheme();
  const style: ViewStyle | undefined =
    focused && Platform.OS === 'web'
      ? {
          outlineStyle: 'solid',
          outlineWidth: focusRing.width,
          outlineColor: colours.primary,
          outlineOffset: focusRing.offset,
        }
      : undefined;
  return {
    style,
    handlers: { onFocus: () => setFocused(true), onBlur: () => setFocused(false) },
  };
}
