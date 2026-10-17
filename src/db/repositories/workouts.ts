import { DomainError } from '@/domain/errors';
import { validateBoard, type TacticalBoard } from '@/domain/tacticalBoard';
import type { TargetMode } from '@/domain/types';
import { validateExerciseConfig, validateTargetValue } from '@/domain/validation';
import type { WorkoutTransfer } from '@/domain/workoutTransfer';
import { and, asc, eq, isNull, max } from 'drizzle-orm';
import { templateSets, workoutExercises, workouts } from '../schema';
import type { Db, Workout, WorkoutExercise } from '../types';
import { assertSameIds, assertValid, nextPosition, requireName } from './common';
import {
  createCustomExercise,
  findExerciseBySeedKey,
  findMatchingCustomExercise,
  requireActiveExercise,
} from './exercises';
import { requireActiveRoutine } from './routines';

export function listWorkouts(db: Db, routineId: number): Workout[] {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.routineId, routineId), isNull(workouts.archivedAt)))
    .orderBy(asc(workouts.position), asc(workouts.id))
    .all();
}

export function getWorkout(db: Db, id: number): Workout | undefined {
  return db.select().from(workouts).where(eq(workouts.id, id)).get();
}

/** An active workout, or `not_found`. */
export function requireActiveWorkout(db: Db, id: number): Workout {
  const workout = getWorkout(db, id);
  if (!workout || workout.archivedAt) throw new DomainError('not_found');
  return workout;
}

/** Appended at the end of the routine's workouts. */
export function insertWorkout(db: Db, routineId: number, name: string): Workout {
  requireActiveRoutine(db, routineId);
  const last = db
    .select({ value: max(workouts.position) })
    .from(workouts)
    .where(eq(workouts.routineId, routineId))
    .get();
  return db
    .insert(workouts)
    .values({ routineId, name, position: nextPosition(last?.value) })
    .returning()
    .get();
}

export function archiveWorkout(db: Db, id: number): void {
  requireActiveWorkout(db, id);
  db.update(workouts).set({ archivedAt: new Date() }).where(eq(workouts.id, id)).run();
}

/** The workout with its exercises and template sets, both ordered. */
export function getWorkoutWithExercises(db: Db, id: number) {
  return db.query.workouts
    .findFirst({
      where: eq(workouts.id, id),
      with: {
        exercises: {
          orderBy: [asc(workoutExercises.position), asc(workoutExercises.id)],
          with: {
            exercise: true,
            sets: { orderBy: [asc(templateSets.position), asc(templateSets.id)] },
          },
        },
      },
    })
    .sync();
}

export interface WorkoutExerciseInput {
  /** Required for `makes_attempts` exercises, absent for `check` ones. */
  targetMode?: TargetMode | null;
  /** One entry per template set: integers >= 1, or all `null` for `check`. */
  targetValues: (number | null)[];
  /** Absent or `null`: no tactical board. */
  tacticalBoard?: TacticalBoard | null;
}

/** Appends the exercise and its sets after validating them. No transaction of its own. */
export function insertWorkoutExercise(
  db: Db,
  workoutId: number,
  exerciseId: number,
  input: WorkoutExerciseInput,
): WorkoutExercise {
  const exercise = requireActiveExercise(db, exerciseId);
  const targetMode = input.targetMode ?? null;
  assertValid(validateExerciseConfig(exercise.trackingType, targetMode));
  const tacticalBoard = input.tacticalBoard ?? null;
  if (tacticalBoard !== null) assertValid(validateBoard(tacticalBoard));

  if (input.targetValues.length === 0) throw new DomainError('invalid_set_count');
  for (const value of input.targetValues) {
    if (exercise.trackingType === 'check') {
      if (value !== null) throw new DomainError('value_not_allowed');
    } else if (value === null) {
      throw new DomainError('invalid_target_value');
    } else {
      assertValid(validateTargetValue(value));
    }
  }

  const last = db
    .select({ value: max(workoutExercises.position) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .get();
  const workoutExercise = db
    .insert(workoutExercises)
    .values({
      workoutId,
      exerciseId,
      position: nextPosition(last?.value),
      targetMode,
      tacticalBoard,
    })
    .returning()
    .get();
  db.insert(templateSets)
    .values(
      input.targetValues.map((targetValue, position) => ({
        workoutExerciseId: workoutExercise.id,
        position,
        targetValue,
      })),
    )
    .run();
  return workoutExercise;
}

export interface WorkoutExerciseItem extends WorkoutExerciseInput {
  exerciseId: number;
}

/**
 * Replaces the workout's exercises and template sets with `items` (at least one). Nothing refers
 * to those rows (sessions keep their own snapshot), so deleting them is safe for history. Meant
 * to run inside a transaction, so a failed item leaves the old template in place.
 */
export function replaceWorkoutExercises(db: Db, workoutId: number, items: WorkoutExerciseItem[]) {
  if (items.length === 0) throw new DomainError('empty_workout');
  db.delete(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).run(); // sets cascade
  for (const item of items) insertWorkoutExercise(db, workoutId, item.exerciseId, item);
  db.update(workouts).set({ updatedAt: new Date() }).where(eq(workouts.id, workoutId)).run();
}

/** `orderedIds` must be exactly the routine's active workout ids, each once. */
export function reorderWorkouts(db: Db, routineId: number, orderedIds: number[]): void {
  db.transaction((tx) => {
    requireActiveRoutine(tx, routineId);
    assertSameIds(
      listWorkouts(tx, routineId).map((workout) => workout.id),
      orderedIds,
    );
    orderedIds.forEach((id, position) => {
      tx.update(workouts).set({ position }).where(eq(workouts.id, id)).run();
    });
  });
}

export interface SaveWorkoutInput {
  /** Edits this workout. Absent: creates one in `routineId`. */
  workoutId?: number;
  /** Ignored when editing: moving a workout is out of scope. */
  routineId: number;
  name: string;
  exercises: WorkoutExerciseItem[];
}

/**
 * Creates or edits a whole template in one transaction: the workout (or its name), then its
 * exercises replaced by `exercises`. A failed rule rolls everything back, so a new workout is
 * never left half-created.
 */
export function saveWorkout(db: Db, input: SaveWorkoutInput): Workout {
  const name = requireName(input.name);
  return db.transaction((tx) => {
    let workout: Workout;
    if (input.workoutId === undefined) {
      workout = insertWorkout(tx, input.routineId, name);
    } else {
      requireActiveWorkout(tx, input.workoutId);
      workout = tx
        .update(workouts)
        .set({ name })
        .where(eq(workouts.id, input.workoutId))
        .returning()
        .get();
    }
    replaceWorkoutExercises(tx, workout.id, input.exercises);
    return workout;
  });
}

/** What importing a transfer finds for one of its exercises. */
export type TransferExerciseMatch =
  | { kind: 'existing'; exerciseId: number; name: string }
  | { kind: 'new_custom' }
  | { kind: 'unknown' };

/**
 * Reads only: for each exercise of the transfer, whether the app already has it (a predefined one
 * by `seedKey`, a custom one equal to it), would create it, or can't know it (a `seedKey` from a
 * newer app). The import preview uses it.
 */
export function matchTransferExercises(db: Db, transfer: WorkoutTransfer): TransferExerciseMatch[] {
  return transfer.exercises.map(({ exercise }) => {
    if ('seedKey' in exercise) {
      const found = findExerciseBySeedKey(db, exercise.seedKey);
      return found
        ? { kind: 'existing', exerciseId: found.id, name: found.name }
        : { kind: 'unknown' };
    }
    const found = findMatchingCustomExercise(db, exercise.custom);
    return found
      ? { kind: 'existing', exerciseId: found.id, name: found.name }
      : { kind: 'new_custom' };
  });
}

/**
 * Adds an imported template to the routine, in one transaction: custom exercises the app doesn't
 * have are created (without media, which doesn't travel), then the workout is saved like any
 * template, so every rule is checked again. A `seedKey` this app doesn't know is
 * `unknown_exercise`; any failure rolls back the workout and the exercises created for it.
 */
export function importWorkout(db: Db, routineId: number, transfer: WorkoutTransfer): Workout {
  const name = requireName(transfer.name);
  return db.transaction((tx) => {
    const workout = insertWorkout(tx, routineId, name);
    const items: WorkoutExerciseItem[] = transfer.exercises.map((item) => {
      const { exercise } = item;
      let exerciseId: number;
      if ('seedKey' in exercise) {
        const found = findExerciseBySeedKey(tx, exercise.seedKey);
        if (!found) throw new DomainError('unknown_exercise');
        exerciseId = found.id;
      } else {
        exerciseId = (
          findMatchingCustomExercise(tx, exercise.custom) ??
          createCustomExercise(tx, exercise.custom)
        ).id;
      }
      return {
        exerciseId,
        targetMode: item.targetMode,
        targetValues: item.targets,
        tacticalBoard: item.board,
      };
    });
    replaceWorkoutExercises(tx, workout.id, items);
    return workout;
  });
}
