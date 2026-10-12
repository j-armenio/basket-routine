import { DEFAULT_THEME_PREFERENCE, isThemePreference, type ThemePreference } from '@/theme/scheme';
import Storage from 'expo-sqlite/kv-store';

// The theme preference sits in expo-sqlite's key-value store, like the language
// (`languageStorage.ts`) and the profile (`src/features/profile/profileStorage.ts`): its own
// database file, so the schema doesn't change. Only these three files import it.

const THEME_KEY = 'settings.theme';

/** Missing or invalid values give the default (dark). */
export function readThemePreference(): ThemePreference {
  const stored = Storage.getItemSync(THEME_KEY);
  return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
}

export function writeThemePreference(preference: ThemePreference): void {
  Storage.setItemSync(THEME_KEY, preference);
}
