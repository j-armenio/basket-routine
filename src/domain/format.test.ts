import {
  durationParts,
  formatDayDate,
  formatElapsed,
  formatFgPct,
  formatMonth,
  formatShortDate,
  formatWorkoutDate,
  parseCount,
  splitExerciseList,
} from './format';

describe('formatFgPct', () => {
  test.each([
    [null, '—'],
    [0, '0%'],
    [1, '100%'],
    [0.5, '50%'],
    [0.7, '70%'],
    [2 / 3, '66.7%'],
    [5 / 11, '45.5%'],
    [0.9994, '99.9%'],
    // rounds to a whole percent: no `.0`
    [0.4996, '50%'],
  ])('%s -> %s', (ratio, expected) => {
    expect(formatFgPct(ratio)).toBe(expected);
  });
});

describe('parseCount', () => {
  test('empty text is empty', () => {
    expect(parseCount('')).toEqual({ kind: 'empty' });
    expect(parseCount('  ')).toEqual({ kind: 'empty' });
  });

  test('digits are an integer', () => {
    expect(parseCount('0')).toEqual({ kind: 'value', value: 0 });
    expect(parseCount('12')).toEqual({ kind: 'value', value: 12 });
    expect(parseCount('007')).toEqual({ kind: 'value', value: 7 });
  });

  test.each(['1.5', '-1', ',', '1,5', 'a', '1 2', '99999999999999999999'])(
    '%j is invalid',
    (text) => {
      expect(parseCount(text)).toEqual({ kind: 'invalid' });
    },
  );
});

describe('durationParts', () => {
  const min = 60_000;

  test.each([
    [0, { kind: 'under_minute' }],
    [29_000, { kind: 'under_minute' }],
    [59_999, { kind: 'under_minute' }],
    [min, { kind: 'minutes', minutes: 1 }],
    [min + 29_000, { kind: 'minutes', minutes: 1 }],
    [42 * min, { kind: 'minutes', minutes: 42 }],
    [59 * min + 40_000, { kind: 'hours_minutes', hours: 1, minutes: 0 }],
    [60 * min, { kind: 'hours_minutes', hours: 1, minutes: 0 }],
    [65 * min, { kind: 'hours_minutes', hours: 1, minutes: 5 }],
    [135 * min, { kind: 'hours_minutes', hours: 2, minutes: 15 }],
    [-5 * min, { kind: 'under_minute' }],
  ])('%s ms -> %o', (ms, expected) => {
    expect(durationParts(ms)).toEqual(expected);
  });
});

test('formatWorkoutDate uses the local date, in the given locale', () => {
  expect(formatWorkoutDate(new Date(2026, 8, 24, 23, 30), 'en-US')).toBe('Thu, Sep 24, 2026');
});

test('formatMonth uses the local month and year, in the given locale', () => {
  expect(formatMonth(new Date(2026, 8, 24, 23, 30), 'en-US')).toBe('September 2026');
  expect(formatMonth(new Date(2027, 0, 1, 0, 5), 'en-US')).toBe('January 2027');
});

describe('splitExerciseList', () => {
  test('lists every name up to the limit', () => {
    expect(splitExerciseList(['Free Throws'])).toEqual({ shown: ['Free Throws'], moreCount: 0 });
    expect(splitExerciseList(['Free Throws', 'Mikan Drill', 'Layups'])).toEqual({
      shown: ['Free Throws', 'Mikan Drill', 'Layups'],
      moreCount: 0,
    });
  });

  test('counts the ones left out', () => {
    expect(splitExerciseList(['A', 'B', 'C', 'D', 'E'])).toEqual({
      shown: ['A', 'B', 'C'],
      moreCount: 2,
    });
    expect(splitExerciseList(['A', 'B', 'C'], 2)).toEqual({ shown: ['A', 'B'], moreCount: 1 });
  });

  test('says so when there is nothing', () => {
    expect(splitExerciseList([])).toEqual({ shown: [], moreCount: 0 });
  });
});

describe('formatElapsed', () => {
  test.each([
    [0, '00:00'],
    [999, '00:00'],
    [1000, '00:01'],
    [65_000, '01:05'],
    [754_000, '12:34'],
    [3_599_999, '59:59'],
    [3_600_000, '1:00:00'],
    [3_723_000, '1:02:03'],
    [-5000, '00:00'],
  ])('%d ms -> %s', (ms, text) => {
    expect(formatElapsed(ms)).toBe(text);
  });
});

test('formatShortDate and formatDayDate use the local date, in the given locale', () => {
  const date = new Date(2026, 8, 28, 23, 30);
  expect(formatShortDate(date, 'en-US')).toBe('Sep 28');
  expect(formatDayDate(date, 'en-US')).toBe('Mon, Sep 28');
});
