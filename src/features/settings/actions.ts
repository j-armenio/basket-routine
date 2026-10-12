import i18n from '@/i18n/i18n';
import { readLanguage, writeLanguage } from './languageStorage';
import type { LanguageCode } from './languages';
import { refreshThemePreference } from './themePreference';
import { writeThemePreference } from './themeStorage';
import type { ThemePreference } from '@/theme/scheme';

/** Persists the language, then switches the running app to it. */
export function setLanguage(code: LanguageCode): void {
  writeLanguage(code);
  void i18n.changeLanguage(code);
}

/** Persists the theme preference, then redraws the app in it. */
export function setThemePreference(preference: ThemePreference): void {
  writeThemePreference(preference);
  refreshThemePreference();
}

export { readLanguage };
