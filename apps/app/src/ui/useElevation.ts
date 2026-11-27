import type { ViewStyle } from 'react-native';

import { elevation } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/** Dark mode drops the e1 shadow (the surface tint carries the lift). Sheets and bars keep e2. */
export function useElevation(level: keyof typeof elevation): ViewStyle {
  const { scheme } = useTheme();
  if (level === 'e1' && scheme === 'dark') return elevation.e0;
  return elevation[level];
}
