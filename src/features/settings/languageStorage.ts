import Storage from 'expo-sqlite/kv-store';
import { isLanguageCode, type LanguageCode } from './languages';

// The app's language sits in expo-sqlite's key-value store, like the profile's name and photo
// (`src/features/profile/profileStorage.ts`): its own database file, so the schema doesn't
// change. Only these two files import it.

const LANGUAGE_KEY = 'settings.language';

/** `null` when nothing is stored yet (first launch). */
export function readLanguage(): LanguageCode | null {
  const stored = Storage.getItemSync(LANGUAGE_KEY);
  return isLanguageCode(stored) ? stored : null;
}

export function writeLanguage(code: LanguageCode): void {
  Storage.setItemSync(LANGUAGE_KEY, code);
}
