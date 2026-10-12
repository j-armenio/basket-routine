import type { TFunction } from 'i18next';

/** The name on the Profile card: the user's, or "Player" until they set one. */
export const displayName = (t: TFunction, name: string) => name.trim() || t('profile.player');

/** The avatar's letter when there is no photo, or `undefined` with no name (a person icon then). */
export function initialOf(name: string): string | undefined {
  const first = [...name.trim()][0];
  return first?.toLocaleUpperCase();
}

/** "No workouts logged yet", "1 workout logged", "8 workouts logged". */
export function workoutsLogged(t: TFunction, count: number): string {
  if (count === 0) return t('profile.workoutsLoggedNone');
  return t('profile.workoutsLogged', { count });
}
