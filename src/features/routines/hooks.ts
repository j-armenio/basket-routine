import { db } from '@/db/client';
import { listRoutinesWithWorkouts } from '@/db/repositories/routines';
import { useMemo } from 'react';
import { useDataVersion } from '../dataStore';

// Sync repository reads redone when the data store's version changes, like `workout/hooks.ts`.

/** The active routines with their active workouts, for the Workout tab. */
export function useRoutines() {
  const version = useDataVersion();
  return useMemo(() => {
    void version; // re-read after any write
    return listRoutinesWithWorkouts(db);
  }, [version]);
}
