import {
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  resolveScheme,
  THEME_PREFERENCES,
} from './scheme';

test('dark is the default preference', () => {
  expect(DEFAULT_THEME_PREFERENCE).toBe('dark');
});

test.each(THEME_PREFERENCES)('%s is a theme preference', (preference) => {
  expect(isThemePreference(preference)).toBe(true);
});

test.each([null, undefined, '', 'auto', 1])('%p is not a theme preference', (value) => {
  expect(isThemePreference(value)).toBe(false);
});

test('light and dark ignore the phone', () => {
  expect(resolveScheme('light', 'dark')).toBe('light');
  expect(resolveScheme('dark', 'light')).toBe('dark');
});

test('system follows the phone, and falls back to dark when it has no scheme', () => {
  expect(resolveScheme('system', 'light')).toBe('light');
  expect(resolveScheme('system', 'dark')).toBe('dark');
  expect(resolveScheme('system', null)).toBe('dark');
  expect(resolveScheme('system', undefined)).toBe('dark');
});
