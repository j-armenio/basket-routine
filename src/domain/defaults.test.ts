import { timeOfDay } from './defaults';

describe('timeOfDay', () => {
  test.each([
    [new Date(2026, 8, 24, 0, 0), 'morning'],
    [new Date(2026, 8, 24, 11, 59), 'morning'],
    [new Date(2026, 8, 24, 12, 0), 'afternoon'],
    [new Date(2026, 8, 24, 17, 59), 'afternoon'],
    [new Date(2026, 8, 24, 18, 0), 'evening'],
    [new Date(2026, 8, 24, 23, 59), 'evening'],
  ])('%s -> %s', (date, expected) => {
    expect(timeOfDay(date)).toBe(expected);
  });
});
