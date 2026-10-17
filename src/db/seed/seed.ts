import { sql } from 'drizzle-orm';
import { exercises, routines } from '../schema';
import { createRoutine } from '../repositories/routines';
import { importWorkout } from '../repositories/workouts';
import type { Db } from '../types';
import { DEFAULT_ROUTINE_NAME, DEFAULT_WORKOUTS } from './defaultWorkouts';
import { SEED_EXERCISES } from './exercises';

/**
 * Upserts the predefined exercises by `seedKey`, in one transaction. Only
 * name, category and description are overwritten: `trackingType` is set on
 * insert and never changed (it would leave existing templates with an invalid
 * `targetMode`). Entries removed from the list and custom exercises are left
 * untouched.
 */
export function seedExercises(db: Db): void {
  db.transaction((tx) => {
    for (const exercise of SEED_EXERCISES) {
      tx.insert(exercises)
        .values({ ...exercise, isCustom: false })
        .onConflictDoUpdate({
          target: exercises.seedKey,
          set: {
            name: exercise.name,
            category: exercise.category,
            description: exercise.description,
            updatedAt: sql`(unixepoch() * 1000)`,
          },
        })
        .run();
    }
  });
}

/**
 * Gives a fresh install a routine with the starter workouts, in one transaction. Only when the
 * database has never held a routine: routines are archived, never deleted, so one the person
 * removed stays a row and the starters don't come back. Needs the exercise catalog seeded first.
 */
export function seedDefaultWorkouts(db: Db): void {
  db.transaction((tx) => {
    if (tx.select({ id: routines.id }).from(routines).limit(1).get()) return;
    const routine = createRoutine(tx, DEFAULT_ROUTINE_NAME);
    for (const workout of DEFAULT_WORKOUTS) importWorkout(tx, routine.id, workout);
  });
}
