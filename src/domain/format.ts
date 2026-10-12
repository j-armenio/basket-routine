/**
 * FG% with one decimal, dropped when it is 0 (`45.3%`, `50%`), or an em dash when there is
 * nothing to divide. Rounded in tenths as an integer, so the "is the decimal 0" test is exact.
 */
export function formatFgPct(ratio: number | null): string {
  if (ratio === null) return '—';
  const tenths = Math.round(ratio * 1000);
  return tenths % 10 === 0 ? `${tenths / 10}%` : `${(tenths / 10).toFixed(1)}%`;
}

export type ParsedCount =
  { kind: 'empty' } | { kind: 'value'; value: number } | { kind: 'invalid' };

/**
 * Reads what a number cell holds: nothing, an integer, or something else. Some number pads
 * still offer `.`, `,` and `-`, so anything but digits is invalid.
 */
export function parseCount(text: string): ParsedCount {
  const trimmed = text.trim();
  if (trimmed === '') return { kind: 'empty' };
  if (!/^\d+$/.test(trimmed)) return { kind: 'invalid' };
  const value = Number(trimmed);
  return Number.isSafeInteger(value) ? { kind: 'value', value } : { kind: 'invalid' };
}

export type DurationParts =
  | { kind: 'under_minute' }
  | { kind: 'minutes'; minutes: number }
  | { kind: 'hours_minutes'; hours: number; minutes: number };

/**
 * A duration's numbers, rounded to the nearest minute: under a minute, minutes alone, or hours
 * and minutes from one hour on. `src/i18n/format.ts` writes the words around them.
 */
export function durationParts(ms: number): DurationParts {
  if (ms < 60_000) return { kind: 'under_minute' };
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours === 0 ? { kind: 'minutes', minutes } : { kind: 'hours_minutes', hours, minutes };
}

/** The active workout's timer: `04:07`, or `1:02:03` from one hour on. Whole seconds, rounded down. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours === 0
    ? `${pad(minutes)}:${pad(seconds)}`
    : `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

/** `Thu, Sep 24, 2026`, in the given `Intl` locale. */
export function formatWorkoutDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** `Sep 25`, the FG% chart's date labels. */
export function formatShortDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** `Mon, Sep 28`, a recent session in an exercise's stats. */
export function formatDayDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** `September 2026`, the History list's month headers. */
export function formatMonth(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/** A names list split for display: the first `max`, and how many were left out. `src/i18n/format.ts` writes the words. */
export function splitExerciseList(
  names: readonly string[],
  max = 3,
): { shown: string[]; moreCount: number } {
  return { shown: names.slice(0, max), moreCount: Math.max(0, names.length - max) };
}
