import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type Palette } from './colors';
import { resolveScheme, type Scheme, type ThemePreference } from './scheme';

export interface Theme {
  scheme: Scheme;
  colors: Palette;
}

const paletteOf: Record<Scheme, Palette> = { dark: darkColors, light: lightColors };

// Without a provider (a component rendered on its own) the app's default, dark.
const ThemeContext = createContext<Theme>({ scheme: 'dark', colors: darkColors });

/** Resolves the saved preference (and the phone's scheme, for `system`) into the palette every
 *  `useColors()` / `makeStyles` reads. */
export function AppThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: ReactNode;
}) {
  const scheme = resolveScheme(preference, useColorScheme());
  const theme = useMemo(() => ({ scheme, colors: paletteOf[scheme] }), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function useColors(): Palette {
  return useContext(ThemeContext).colors;
}
