import type { TargetMode } from './types';

/** The target a new shooting set starts with, per mode: 10 attempts to take, or 5 makes to hit. */
export const DEFAULT_TARGET_VALUE: Record<TargetMode, number> = {
  attempts: 10,
  makes: 5,
};

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

/** The time of day a date falls in, for an empty workout's default name. */
export function timeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
