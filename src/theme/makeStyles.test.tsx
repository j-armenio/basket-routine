import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { darkColors, lightColors } from './colors';
import { makeStyles } from './makeStyles';
import { AppThemeProvider } from './ThemeContext';

const useStyles = makeStyles((colors) => ({ box: { backgroundColor: colors.background } }));

const withTheme = (preference: 'light' | 'dark') =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <AppThemeProvider preference={preference}>{children}</AppThemeProvider>;
  };

test('builds the styles from the palette in use', async () => {
  const dark = await renderHook(() => useStyles(), { wrapper: withTheme('dark') });
  const light = await renderHook(() => useStyles(), { wrapper: withTheme('light') });
  expect(dark.result.current.box.backgroundColor).toBe(darkColors.background);
  expect(light.result.current.box.backgroundColor).toBe(lightColors.background);
});

test('builds them once per palette', async () => {
  const first = await renderHook(() => useStyles(), { wrapper: withTheme('light') });
  const second = await renderHook(() => useStyles(), { wrapper: withTheme('light') });
  expect(second.result.current).toBe(first.result.current);
  const other = await renderHook(() => useStyles(), { wrapper: withTheme('dark') });
  expect(other.result.current).not.toBe(first.result.current);
});

test('falls back to the dark palette without a provider', async () => {
  const { result } = await renderHook(() => useStyles());
  expect(result.current.box.backgroundColor).toBe(darkColors.background);
});
