import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import path from 'node:path';
import {
  insertWorkout,
  insertWorkoutExercise,
  requireActiveWorkout,
  type WorkoutExerciseInput,
} from './repositories/workouts';
import * as schema from './schema';
import type { Db, Workout, WorkoutExercise } from './types';

/** A fresh in-memory database with the real migrations applied. */
export function createTestDb(): Db {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  return db;
}

// Fixtures: the app saves a whole template at once (`saveWorkout`), so these build one piece at a
// time for tests that need an empty workout or a template grown step by step.

/** A workout appended at the end of the routine's workouts. */
export function createWorkout(db: Db, routineId: number, name: string): Workout {
  return db.transaction((tx) => insertWorkout(tx, routineId, name));
}

export function renameWorkout(db: Db, id: number, name: string): Workout {
  requireActiveWorkout(db, id);
  return db
    .update(schema.workouts)
    .set({ name })
    .where(eq(schema.workouts.id, id))
    .returning()
    .get();
}

/** An exercise (validated, with its sets) appended to the workout. */
export function addWorkoutExercise(
  db: Db,
  workoutId: number,
  exerciseId: number,
  input: WorkoutExerciseInput,
): WorkoutExercise {
  return db.transaction((tx) => {
    requireActiveWorkout(tx, workoutId);
    return insertWorkoutExercise(tx, workoutId, exerciseId, input);
  });
}
