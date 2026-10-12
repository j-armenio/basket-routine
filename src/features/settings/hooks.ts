import { useTranslation } from 'react-i18next';
import { isLanguageCode, LANGUAGES, localeOf, type LanguageCode } from './languages';

/** The current language (code and `Intl` locale) and the supported list; re-renders on change. */
export function useLanguage() {
  const { i18n } = useTranslation();
  const code: LanguageCode = isLanguageCode(i18n.language) ? i18n.language : 'en';
  return { code, locale: localeOf(code), languages: LANGUAGES };
}

export { useThemePreference } from './themePreference';
