import Storage from 'expo-sqlite/kv-store';
import i18n from '@/i18n/i18n';
import { setLanguage, setThemePreference } from './actions';
import { readLanguage } from './languageStorage';
import { getThemePreference, refreshThemePreference } from './themePreference';
import { readThemePreference } from './themeStorage';

const clearStorage = (jest.requireMock('expo-sqlite/kv-store') as { __clear: () => void }).__clear;

afterEach(() => {
  clearStorage();
  refreshThemePreference();
});

test('readLanguage is null with nothing stored', () => {
  // The mock starts (and `__clear` restores) with a language already set, for the flow tests;
  // this test removes it to check the genuine first-launch case.
  Storage.removeItemSync('settings.language');
  expect(readLanguage()).toBeNull();
});

test('setLanguage persists the choice and switches the running app', () => {
  setLanguage('pt-BR');
  expect(readLanguage()).toBe('pt-BR');
  expect(i18n.language).toBe('pt-BR');

  setLanguage('en');
  expect(readLanguage()).toBe('en');
  expect(i18n.language).toBe('en');
});

test('the theme is dark with nothing stored, or with an invalid value', () => {
  expect(readThemePreference()).toBe('dark');
  Storage.setItemSync('settings.theme', 'sepia');
  expect(readThemePreference()).toBe('dark');
});

test('setThemePreference persists the choice and updates the store', () => {
  setThemePreference('light');
  expect(readThemePreference()).toBe('light');
  expect(getThemePreference()).toBe('light');

  setThemePreference('system');
  expect(readThemePreference()).toBe('system');
  expect(getThemePreference()).toBe('system');
});
