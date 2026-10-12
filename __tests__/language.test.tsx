import Storage from 'expo-sqlite/kv-store';
import { useDatabaseSetup } from '@/db/useDatabaseSetup';
import { askLanguageOnLaunch } from '@/features/settings/launchGate';
import i18n from '@/i18n/i18n';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { expectAccessibleControls } from '@/test-utils/a11y';

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

jest.setTimeout(30_000);

const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
const renderApp = () => renderRouter('./app');

beforeEach(() => {
  jest.mocked(useDatabaseSetup).mockReturnValue({ ready: true, error: null });
  jest.mocked(askLanguageOnLaunch).mockReturnValue(true);
});

afterEach(() => {
  void i18n.changeLanguage('en');
});

test('the picker shows on every launch, with the stored language selected; confirming opens the tabs', async () => {
  Storage.setItemSync('settings.language', 'pt-BR');
  const app = renderApp();
  await app;

  expect(screen.queryByRole('button', { name: 'Start Empty Workout' })).toBeNull();
  expect(screen.getByRole('radio', { name: 'Português (Brasil)' })).toBeSelected();
  expectAccessibleControls();

  const user = setupUser();
  await user.press(screen.getByRole('button', { name: 'Confirmar' }));

  expect(app.getPathname()).toBe('/');
  expect(Storage.getItemSync('settings.language')).toBe('pt-BR');
  expect(screen.getByRole('button', { name: 'Iniciar Treino Vazio' })).toBeOnTheScreen();
});

test('with no stored language, the picker shows first; selecting one retitles it, confirming opens the tabs in it', async () => {
  Storage.removeItemSync('settings.language');
  const app = renderApp();
  await app;

  expect(screen.queryByRole('button', { name: 'Start Empty Workout' })).toBeNull();
  expect(screen.getByText('Choose your language')).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'English' })).toBeSelected();
  expectAccessibleControls();

  const user = setupUser();
  await user.press(screen.getByRole('radio', { name: 'Português (Brasil)' }));

  // Only the picker follows the selection; nothing is stored or switched until Confirm.
  expect(screen.getByText('Escolha seu idioma')).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Português (Brasil)' })).toBeSelected();
  expect(Storage.getItemSync('settings.language')).toBeNull();
  expect(i18n.language).toBe('en');
  expectAccessibleControls();

  await user.press(screen.getByRole('button', { name: 'Confirmar' }));

  expect(app.getPathname()).toBe('/');
  expect(Storage.getItemSync('settings.language')).toBe('pt-BR');
  expect(screen.getByRole('button', { name: 'Iniciar Treino Vazio' })).toBeOnTheScreen();
  expectAccessibleControls();
});
