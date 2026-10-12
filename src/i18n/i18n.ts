import { readLanguage } from '@/features/settings/languageStorage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en';
import ptBR from './translations/pt-BR';

// Read synchronously (the kv-store's own file, not the app's DB), so the first screen is already
// in the right language: `app/_layout.tsx` imports this module before its first render. Falls
// back to English with nothing stored yet (the first-launch gate then shows the picker).
void i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: readLanguage() ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18next;
