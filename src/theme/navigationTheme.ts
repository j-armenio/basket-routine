import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import type { Palette } from './colors';
import type { Scheme } from './scheme';

export function navigationThemeFor(scheme: Scheme, colors: Palette): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.backgroundDeep,
      text: colors.textPrimary,
      border: colors.divider,
    },
  };
}
