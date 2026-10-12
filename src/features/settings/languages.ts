export const LANGUAGE_CODES = ['en', 'pt-BR'] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export interface LanguageOption {
  code: LanguageCode;
  /** For `Intl`/`toLocaleDateString` (`formatMonth`, `formatWorkoutDate`, …). */
  locale: string;
  /** The language's name written in itself, so it reads right before it is chosen. */
  name: string;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', locale: 'en-US', name: 'English' },
  { code: 'pt-BR', locale: 'pt-BR', name: 'Português (Brasil)' },
];

export const isLanguageCode = (value: unknown): value is LanguageCode =>
  LANGUAGE_CODES.includes(value as LanguageCode);

export const localeOf = (code: LanguageCode): string =>
  LANGUAGES.find((language) => language.code === code)?.locale ?? 'en-US';
