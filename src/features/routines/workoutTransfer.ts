import { db } from '@/db/client';
import { getWorkoutWithExercises, matchTransferExercises } from '@/db/repositories/workouts';
import {
  parseWorkoutTransferText,
  qrLink,
  toWorkoutTransfer,
  type ParseResult,
  type WorkoutTransfer,
} from '@/domain/workoutTransfer';
import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Taking a workout template out of the app (a file, a QR code) and reading one back. The format
// and its rules are `src/domain/workoutTransfer.ts`; this file is the I/O around it. Nothing here
// writes to the database: importing goes through `actions.ts`.

/** The workout's template as a transfer, or `null` when it no longer exists. */
export function readWorkoutTransfer(workoutId: number): WorkoutTransfer | null {
  const workout = getWorkoutWithExercises(db, workoutId);
  return workout && !workout.archivedAt ? toWorkoutTransfer(workout) : null;
}

/** The deep link to show as a QR code: `too_large` when it wouldn't fit one. */
export function workoutQrLink(
  workoutId: number,
): { ok: true; link: string; name: string } | { ok: false; reason: 'too_large' | 'not_found' } {
  const transfer = readWorkoutTransfer(workoutId);
  if (!transfer) return { ok: false, reason: 'not_found' };
  const link = qrLink(transfer);
  return link === null
    ? { ok: false, reason: 'too_large' }
    : { ok: true, link, name: transfer.name };
}

/** A name that is safe in a file name, from the workout's. */
function fileSlug(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'workout' : slug.toLowerCase();
}

/**
 * Writes the workout to a `.json` file in the cache and opens Android's share sheet with it.
 * `false` when the workout is gone, sharing isn't available or the file can't be written.
 */
export async function exportWorkoutFile(workoutId: number, dialogTitle: string): Promise<boolean> {
  try {
    const transfer = readWorkoutTransfer(workoutId);
    if (!transfer || !(await Sharing.isAvailableAsync())) return false;
    const directory = new Directory(Paths.cache, 'transfer');
    directory.create({ idempotent: true, intermediates: true });
    const file = new File(directory, `${fileSlug(transfer.name)}.json`);
    file.create({ overwrite: true });
    file.write(JSON.stringify(transfer, null, 2));
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle });
    return true;
  } catch {
    return false;
  }
}

export type PickedTransfer =
  { kind: 'canceled' } | { kind: 'unreadable' } | { kind: 'read'; result: ParseResult };

/**
 * Lets the person choose a file and reads it as a transfer. Any type is offered, since a `.json`
 * that came through a chat app often has no type: the content is what gets checked.
 */
export async function pickTransferFile(): Promise<PickedTransfer> {
  const picked = await getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (picked.canceled) return { kind: 'canceled' };
  try {
    const file = new File(picked.assets[0].uri);
    const text = file.textSync();
    try {
      file.delete(); // the copy in the cache
    } catch {
      // a leftover only takes space
    }
    return { kind: 'read', result: parseWorkoutTransferText(text) };
  } catch {
    return { kind: 'unreadable' };
  }
}

export interface TransferPreview {
  /** The exercises' names, in order. */
  names: string[];
  /** Custom exercises the import would create. */
  newCustom: number;
  /** Predefined exercises this version of the app doesn't have: the import would fail. */
  unknown: boolean;
}

/** What importing the transfer would do, for the preview. Reads only. */
export function previewTransfer(transfer: WorkoutTransfer): TransferPreview {
  const matches = matchTransferExercises(db, transfer);
  return {
    names: transfer.exercises.map(({ exercise }, index) => {
      const match = matches[index];
      if (match.kind === 'existing') return match.name;
      return 'custom' in exercise ? exercise.custom.name : exercise.seedKey;
    }),
    newCustom: matches.filter((match) => match.kind === 'new_custom').length,
    unknown: matches.some((match) => match.kind === 'unknown'),
  };
}
