import Storage from 'expo-sqlite/kv-store';
import { useDatabaseSetup } from '@/db/useDatabaseSetup';
import i18n from '@/i18n/i18n';
import { refreshThemePreference } from '@/features/settings/themePreference';
import { darkColors, lightColors } from '@/theme/colors';
import { expectAccessibleControls } from '@/test-utils/a11y';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';

jest.mock('@/db/client', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { createTestDb } = require('@/db/test-utils');
  const { seedExercises } = require('@/db/seed/seed');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const db = createTestDb();
  seedExercises(db);
  return { db };
});
jest.mock('@/db/useDatabaseSetup', () => ({ useDatabaseSetup: jest.fn() }));

// The phone's own scheme, which `System` follows.
let mockPhoneScheme: 'light' | 'dark' = 'dark';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockPhoneScheme,
}));

jest.setTimeout(30_000);

const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
const clearStorage = (jest.requireMock('expo-sqlite/kv-store') as { __clear: () => void }).__clear;

beforeEach(() => {
  jest.mocked(useDatabaseSetup).mockReturnValue({ ready: true, error: null });
  mockPhoneScheme = 'dark';
});

afterEach(() => {
  clearStorage();
  refreshThemePreference();
  void i18n.changeLanguage('en');
});

const background = () =>
  StyleSheet.flatten(screen.getByTestId('screen').props.style).backgroundColor;

async function openSettings() {
  const user = setupUser();
  await user.press(screen.getByRole('tab', { name: 'Profile' }));
  await user.press(screen.getByRole('button', { name: 'Settings' }));
  return user;
}

test('Settings shows Dark selected by default, with the hint', async () => {
  await renderRouter('./app');
  await openSettings();

  expect(screen.getByRole('header', { name: 'Appearance' })).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Dark' })).toBeSelected();
  expect(screen.getByRole('radio', { name: 'Light' })).not.toBeSelected();
  expect(screen.getByRole('radio', { name: 'System' })).not.toBeSelected();
  expect(screen.getByText("System follows your phone's setting.")).toBeOnTheScreen();
  expect(background()).toBe(darkColors.background);
  expectAccessibleControls();
});

test('Light repaints at once, is stored, and a fresh render keeps it', async () => {
  await renderRouter('./app');
  const user = await openSettings();

  await user.press(screen.getByRole('radio', { name: 'Light' }));

  expect(screen.getByRole('radio', { name: 'Light' })).toBeSelected();
  expect(background()).toBe(lightColors.background);
  expect(Storage.getItemSync('settings.theme')).toBe('light');
  expectAccessibleControls();

  await screen.unmount();
  await renderRouter('./app');
  await openSettings();

  expect(screen.getByRole('radio', { name: 'Light' })).toBeSelected();
  expect(background()).toBe(lightColors.background);
});

test('System follows the phone', async () => {
  mockPhoneScheme = 'light';
  await renderRouter('./app');
  const user = await openSettings();

  await user.press(screen.getByRole('radio', { name: 'System' }));

  expect(screen.getByRole('radio', { name: 'System' })).toBeSelected();
  expect(Storage.getItemSync('settings.theme')).toBe('system');
  expect(background()).toBe(lightColors.background);
  expectAccessibleControls();

  await user.press(screen.getByRole('radio', { name: 'Dark' }));
  expect(background()).toBe(darkColors.background);
});

test('the labels follow the language', async () => {
  await renderRouter('./app');
  const user = await openSettings();

  await user.press(screen.getByRole('radio', { name: 'Português (Brasil)' }));

  expect(screen.getByRole('header', { name: 'Aparência' })).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Escuro' })).toBeSelected();
  expect(screen.getByRole('radio', { name: 'Claro' })).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Sistema' })).toBeOnTheScreen();
  expectAccessibleControls();
});
