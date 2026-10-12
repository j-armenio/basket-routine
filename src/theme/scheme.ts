export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type Scheme = 'light' | 'dark';

/** Dark unless the user picks otherwise in Settings. */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'dark';

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some((preference) => preference === value);
}

/** The scheme to draw: the preference, or the phone's when the preference is `system`. */
export function resolveScheme(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): Scheme {
  if (preference === 'system') return systemScheme === 'light' ? 'light' : 'dark';
  return preference;
}
