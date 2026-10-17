import { elapsedMs, sessionDurationMs, totalPausedMs, type SessionTiming } from './sessionTime';

const MIN = 60_000;
const start = new Date(2026, 9, 17, 10, 0);
const at = (minutes: number) => new Date(start.getTime() + minutes * MIN);
const timing = (patch: Partial<SessionTiming> = {}): SessionTiming => ({
  startedAt: start,
  finishedAt: null,
  pausedAt: null,
  pausedMs: 0,
  ...patch,
});

describe('elapsedMs', () => {
  test('counts from the start while running, minus earlier pauses', () => {
    expect(elapsedMs(timing(), at(12))).toBe(12 * MIN);
    expect(elapsedMs(timing({ pausedMs: 5 * MIN }), at(12))).toBe(7 * MIN);
  });

  test('stays at the moment it was paused', () => {
    const paused = timing({ pausedAt: at(10), pausedMs: 2 * MIN });
    expect(elapsedMs(paused, at(10))).toBe(8 * MIN);
    expect(elapsedMs(paused, at(40))).toBe(8 * MIN);
  });
});

describe('totalPausedMs', () => {
  test('adds the pause under way to the earlier ones', () => {
    expect(totalPausedMs(timing({ pausedMs: 2 * MIN }), at(30))).toBe(2 * MIN);
    expect(totalPausedMs(timing({ pausedAt: at(10), pausedMs: 2 * MIN }), at(15))).toBe(7 * MIN);
  });
});

describe('sessionDurationMs', () => {
  test('a finished session leaves its pauses out', () => {
    expect(sessionDurationMs(timing({ finishedAt: at(45), pausedMs: 15 * MIN }))).toBe(30 * MIN);
  });

  test('no finish time gives 0', () => {
    expect(sessionDurationMs(timing())).toBe(0);
  });
});
