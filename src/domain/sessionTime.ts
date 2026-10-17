/** A session's clock: when it started, finished and was paused (the `sessions` columns). */
export interface SessionTiming {
  startedAt: Date;
  finishedAt: Date | null;
  /** When the timer was paused; null while it runs. */
  pausedAt: Date | null;
  /** The time spent paused before `pausedAt`. */
  pausedMs: number;
}

/** All the time spent paused up to `now`, the pause under way included. */
export function totalPausedMs(timing: SessionTiming, now: Date): number {
  return (
    timing.pausedMs + (timing.pausedAt ? Math.max(0, now.getTime() - timing.pausedAt.getTime()) : 0)
  );
}

/**
 * The time the timer has counted at `now`: from the start, minus the pauses. A paused timer stays
 * at the moment it was paused, a finished one at its finish.
 */
export function elapsedMs(timing: SessionTiming, now: Date): number {
  const end = timing.pausedAt ?? timing.finishedAt ?? now;
  return Math.max(0, end.getTime() - timing.startedAt.getTime() - timing.pausedMs);
}

/** A finished session's duration, pauses left out; 0 without a finish time. */
export function sessionDurationMs(timing: SessionTiming): number {
  return timing.finishedAt ? elapsedMs(timing, timing.finishedAt) : 0;
}
