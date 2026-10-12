import { act, renderHook } from '@testing-library/react-native';
import { setThemePreference } from './actions';
import { refreshThemePreference, useThemePreference } from './themePreference';

const clearStorage = (jest.requireMock('expo-sqlite/kv-store') as { __clear: () => void }).__clear;

afterEach(() => {
  clearStorage();
  refreshThemePreference();
});

test('a component using the preference re-renders when it changes', async () => {
  const { result } = await renderHook(() => useThemePreference());
  expect(result.current).toBe('dark');

  await act(() => setThemePreference('light'));
  expect(result.current).toBe('light');

  await act(() => setThemePreference('system'));
  expect(result.current).toBe('system');
});
