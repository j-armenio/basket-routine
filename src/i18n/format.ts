import { durationParts, splitExerciseList } from '@/domain/format';
import type { TFunction } from 'i18next';

/** `42 min`, or `1 h 05 min` from one hour on; `< 1 min` under one. The words around `durationParts`. */
export function formatDuration(t: TFunction, ms: number): string {
  const parts = durationParts(ms);
  switch (parts.kind) {
    case 'under_minute':
      return t('common.durationUnderMinute');
    case 'minutes':
      return t('common.durationMinutes', { minutes: parts.minutes });
    case 'hours_minutes':
      return t('common.durationHoursMinutes', {
        hours: parts.hours,
        minutes: String(parts.minutes).padStart(2, '0'),
      });
  }
}

/** `Free Throws, Mikan Drill, Layups`, or the first `max` names and `+N more`. The words around `splitExerciseList`. */
export function formatExerciseList(t: TFunction, names: readonly string[], max = 3): string {
  if (names.length === 0) return t('common.noExercisesList');
  const { shown, moreCount } = splitExerciseList(names, max);
  const list = shown.join(', ');
  return moreCount === 0 ? list : `${list} ${t('common.andMore', { count: moreCount })}`;
}
