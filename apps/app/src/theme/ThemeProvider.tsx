import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';
import { vars } from 'nativewind';

import { colours, type ColourName, type Palette, type Scheme } from './tokens';

type Theme = { scheme: Scheme; colours: Palette };

const ThemeContext = createContext<Theme | null>(null);

/** Hex string to space separated channels ("r g b"), the form the Tailwind colour config reads. */
export function hexToChannels(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function themeVariables(palette: Palette): Record<string, string> {
  const entries = (Object.keys(palette) as ColourName[]).map(
    (name) => [`--c-${name}`, hexToChannels(palette[name])] as const,
  );
  return Object.fromEntries(entries);
}

/** Follows the system scheme. There is no in-app override in v1. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = useMemo<Theme>(() => ({ scheme, colours: colours[scheme] }), [scheme]);
  const style = useMemo(() => vars(themeVariables(theme.colours)), [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <View style={[{ flex: 1 }, style]} className="bg-bg">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

/**
 * Re-applies the theme variables to a subtree that renders outside ThemeProvider's view, such as the
 * content of a Modal (a portal on web).
 */
export function ThemeScope({ children }: { children: ReactNode }) {
  const { colours: palette } = useTheme();
  const style = useMemo(() => vars(themeVariables(palette)), [palette]);
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
}

/** For the few places that need a raw colour (status bar, tab bar tint, icons). Prefer classes. */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}
