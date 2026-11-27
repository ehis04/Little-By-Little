import { useWindowDimensions } from 'react-native';

import { breakpoints } from './tokens';

export type Breakpoint = 'sm' | 'md' | 'lg';

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  return 'sm';
}
