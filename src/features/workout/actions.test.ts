/** @jest-environment node */
import type { Db } from '@/db/types';
import { exercises } from '@/db/schema';
import { getInProgressSession, getSessionDetail } from '@/db/repositories/sessions';
import { eq } from 'drizzle-orm';
import * as actions from './actions';
import { subscribe, type ActionResult } from '../dataStore';

jest.mock('@/db/client', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { createTestDb } = require('@/db/test-utils');
  const { seedExercises } = require('@/db/seed/seed');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const db = createTestDb();
  seedExercises(db);
  return { db };
});

const { db } = jest.requireMock('@/db/client') as { db: Db };

const exerciseId = (seedKey: string) =>
  db.select().from(exercises).where(eq(exercises.seedKey, seedKey)).get()!.id;

function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(`unexpected failure: ${result.reason}`);
  return result.value;
}

let notifications = 0;
subscribe(() => {
  notifications += 1;
});

afterEach(() => {
  const session = getInProgressSession(db);
  if (session) actions.discardWorkout(session.id);
  notifications = 0;
});

test('startEmptyWorkout names the session after the time of day', () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 8, 24, 9, 30));
  const session = unwrap(actions.startEmptyWorkout());
  jest.useRealTimers();

  expect(session).toMatchObject({ name: 'Morning Workout', status: 'in_progress' });
  expect(notifications).toBe(1);
});

test('a successful write notifies once, a rejected one returns its reason and does not', () => {
  const session = unwrap(actions.startEmptyWorkout());
  notifications = 0;

  const added = unwrap(actions.addExercise(session.id, exerciseId('free_throws'), 'attempts'));
  expect(notifications).toBe(1);
  const [set] = getSessionDetail(db, session.id)!.exercises[0].sets;
  expect(set).toMatchObject({ targetValue: 10 });

  expect(actions.updateSet(set.id, { loggedValue: 11 })).toEqual({
    ok: false,
    reason: 'makes_exceed_attempts',
  });
  expect(actions.addExercise(session.id, exerciseId('free_throws'))).toEqual({
    ok: false,
    reason: 'target_mode_required',
  });
  expect(actions.startEmptyWorkout()).toEqual({ ok: false, reason: 'session_in_progress_exists' });
  expect(notifications).toBe(1);
  expect(added.id).toBeGreaterThan(0);
});

test('discardWorkout removes the session and notifies', () => {
  const session = unwrap(actions.startEmptyWorkout());
  notifications = 0;

  unwrap(actions.discardWorkout(session.id));

  expect(getInProgressSession(db)).toBeUndefined();
  expect(notifications).toBe(1);
});
