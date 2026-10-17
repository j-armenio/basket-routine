/** @jest-environment node */
import { count, eq } from 'drizzle-orm';
import { createTestDb } from '../test-utils';
import { exercises, routines } from '../schema';
import { listRoutines, archiveRoutine, createRoutine } from '../repositories/routines';
import { getWorkoutWithExercises, listWorkouts } from '../repositories/workouts';
import { parseWorkoutTransfer } from '@/domain/workoutTransfer';
import { DEFAULT_ROUTINE_NAME, DEFAULT_WORKOUTS } from './defaultWorkouts';
import { SEED_EXERCISES } from './exercises';
import { seedDefaultWorkouts, seedExercises } from './seed';

const total = (db: ReturnType<typeof createTestDb>) =>
  db.select({ n: count() }).from(exercises).get()!.n;

describe('seedExercises', () => {
  test('inserts the whole catalog', () => {
    const db = createTestDb();
    seedExercises(db);
    expect(total(db)).toBe(SEED_EXERCISES.length);
    expect(new Set(SEED_EXERCISES.map((e) => e.seedKey)).size).toBe(SEED_EXERCISES.length);
  });

  test('is idempotent', () => {
    const db = createTestDb();
    seedExercises(db);
    seedExercises(db);
    expect(total(db)).toBe(SEED_EXERCISES.length);
  });

  test('updates a changed description without touching custom exercises', () => {
    const db = createTestDb();
    seedExercises(db);
    db.insert(exercises)
      .values({
        name: 'My drill',
        category: 'shooting',
        trackingType: 'check',
        description: 'mine',
        isCustom: true,
      })
      .run();
    db.update(exercises)
      .set({ description: 'stale', name: 'Old name' })
      .where(eq(exercises.seedKey, 'free_throws'))
      .run();

    seedExercises(db);

    const seeded = db.select().from(exercises).where(eq(exercises.seedKey, 'free_throws')).get()!;
    const expected = SEED_EXERCISES.find((e) => e.seedKey === 'free_throws')!;
    expect(seeded.description).toBe(expected.description);
    expect(seeded.name).toBe(expected.name);

    const custom = db.select().from(exercises).where(eq(exercises.isCustom, true)).all();
    expect(custom).toHaveLength(1);
    expect(custom[0]).toMatchObject({ name: 'My drill', description: 'mine' });
    expect(total(db)).toBe(SEED_EXERCISES.length + 1);
  });

  test('never changes trackingType of an existing exercise', () => {
    const db = createTestDb();
    seedExercises(db);
    db.update(exercises)
      .set({ trackingType: 'check' })
      .where(eq(exercises.seedKey, 'free_throws'))
      .run();
    seedExercises(db);
    const row = db.select().from(exercises).where(eq(exercises.seedKey, 'free_throws')).get()!;
    expect(row.trackingType).toBe('check');
  });
});

describe('seedDefaultWorkouts', () => {
  test('the starters are valid transfers', () => {
    for (const workout of DEFAULT_WORKOUTS) {
      expect(parseWorkoutTransfer(workout)).toEqual({ ok: true, transfer: workout });
    }
  });

  test('a fresh install gets one routine with both workouts, boards and targets included', () => {
    const db = createTestDb();
    seedExercises(db);

    seedDefaultWorkouts(db);

    const [routine] = listRoutines(db);
    expect(routine.name).toBe(DEFAULT_ROUTINE_NAME);
    const workouts = listWorkouts(db, routine.id);
    expect(workouts.map((w) => w.name)).toEqual(['Off the dribble shooting', 'Finishing']);
    const [shooting, finishing] = workouts.map((w) => getWorkoutWithExercises(db, w.id)!);
    expect(shooting.exercises).toHaveLength(10);
    expect(shooting.exercises[0].sets.map((s) => s.targetValue)).toEqual([5, 5, 5]);
    expect(shooting.exercises[0].tacticalBoard?.elements).toHaveLength(3);
    expect(shooting.exercises[9].tacticalBoard).toBeNull();
    expect(finishing.exercises).toHaveLength(8);
  });

  test('runs once: not again, nor when the person archived the routine or has their own', () => {
    const db = createTestDb();
    seedExercises(db);
    seedDefaultWorkouts(db);
    seedDefaultWorkouts(db);
    expect(db.select({ n: count() }).from(routines).get()!.n).toBe(1);

    archiveRoutine(db, listRoutines(db)[0].id);
    seedDefaultWorkouts(db);
    expect(db.select({ n: count() }).from(routines).get()!.n).toBe(1);

    const other = createTestDb();
    seedExercises(other);
    createRoutine(other, 'Mine');
    seedDefaultWorkouts(other);
    expect(listRoutines(other).map((r) => r.name)).toEqual(['Mine']);
  });
});
