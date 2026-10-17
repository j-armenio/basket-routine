import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import {
  validateBoard,
  type BoardElement,
  type BoardPoint,
  type TacticalBoard,
} from './tacticalBoard';
import {
  CATEGORIES,
  TARGET_MODES,
  TRACKING_TYPES,
  type Category,
  type TargetMode,
  type TrackingType,
} from './types';
import { validateExerciseConfig, validateTargetValue, type ValidationReason } from './validation';

// A workout template as data that can leave the app (a JSON file, or a QR code) and be read back
// by another install. Only the template travels: its name, exercises, targets and boards. History
// and the media of custom exercises (local files) stay behind. Pure: no database, no words.

export const TRANSFER_FORMAT = 'basket-routine/workout';
export const TRANSFER_VERSION = 1;
export const MAX_TRANSFER_EXERCISES = 50;
export const MAX_TRANSFER_SETS = 50;
/** The deep link a QR code holds; the camera of the system may open the app with it. */
export const TRANSFER_LINK_PREFIX = 'basketroutine://import-workout?d=';
/**
 * The longest QR link kept: a QR code holds at most 2953 bytes, and one near that is too dense to
 * read from another screen.
 */
export const MAX_QR_LINK_LENGTH = 1800;

/** A predefined exercise travels as its `seedKey`; a custom one as what it takes to recreate it. */
export type TransferExerciseRef =
  | { seedKey: string }
  | {
      custom: {
        name: string;
        category: Category;
        trackingType: TrackingType;
        description: string;
      };
    };

export interface TransferExercise {
  exercise: TransferExerciseRef;
  targetMode: TargetMode | null;
  /** One entry per set: integers >= 1, or all `null` for a `check` exercise. */
  targets: (number | null)[];
  board: TacticalBoard | null;
}

export interface WorkoutTransfer {
  format: typeof TRANSFER_FORMAT;
  version: typeof TRANSFER_VERSION;
  name: string;
  exercises: TransferExercise[];
}

/** What `toWorkoutTransfer` reads: the shape of a workout with its exercises and sets loaded. */
export interface TransferSource {
  name: string;
  exercises: {
    targetMode: TargetMode | null;
    tacticalBoard: TacticalBoard | null;
    exercise: {
      seedKey: string | null;
      isCustom: boolean;
      name: string;
      category: Category;
      trackingType: TrackingType;
      description: string;
    };
    sets: { targetValue: number | null }[];
  }[];
}

/** Board points keep three decimals: 1.5 cm on the court, invisible, and a smaller QR code. */
const roundCoordinate = (n: number) => Math.round(n * 1000) / 1000;
const roundPoint = ([x, y]: BoardPoint): BoardPoint => [roundCoordinate(x), roundCoordinate(y)];

function roundElement(element: BoardElement): BoardElement {
  switch (element.type) {
    case 'x':
      return { type: 'x', at: roundPoint(element.at) };
    case 'arrow':
      return {
        type: 'arrow',
        from: roundPoint(element.from),
        to: roundPoint(element.to),
        ...(element.via ? { via: roundPoint(element.via) } : {}),
      };
    case 'pen':
      return { type: 'pen', points: element.points.map(roundPoint) };
  }
}

export function toWorkoutTransfer(source: TransferSource): WorkoutTransfer {
  return {
    format: TRANSFER_FORMAT,
    version: TRANSFER_VERSION,
    name: source.name,
    exercises: source.exercises.map((item) => {
      const { exercise } = item;
      return {
        exercise:
          exercise.seedKey !== null && !exercise.isCustom
            ? { seedKey: exercise.seedKey }
            : {
                custom: {
                  name: exercise.name,
                  category: exercise.category,
                  trackingType: exercise.trackingType,
                  description: exercise.description,
                },
              },
        targetMode: item.targetMode,
        targets: item.sets.map((set) => set.targetValue),
        board: item.tacticalBoard && {
          version: 1,
          elements: item.tacticalBoard.elements.map(roundElement),
        },
      };
    }),
  };
}

export type ParseResult =
  { ok: true; transfer: WorkoutTransfer } | { ok: false; reason: ValidationReason };

const invalid: ParseResult = { ok: false, reason: 'invalid_transfer' };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

function parseRef(value: unknown): TransferExerciseRef | null {
  if (!isRecord(value)) return null;
  if (typeof value.seedKey === 'string' && value.seedKey !== '') {
    return { seedKey: value.seedKey };
  }
  const custom = value.custom;
  if (!isRecord(custom)) return null;
  const { name, category, trackingType, description } = custom;
  if (typeof name !== 'string' || name.trim() === '') return null;
  if (!isOneOf(CATEGORIES, category) || !isOneOf(TRACKING_TYPES, trackingType)) return null;
  if (description !== undefined && typeof description !== 'string') return null;
  return {
    custom: { name: name.trim(), category, trackingType, description: description?.trim() ?? '' },
  };
}

function parseExercise(value: unknown): TransferExercise | null {
  if (!isRecord(value)) return null;
  const exercise = parseRef(value.exercise);
  if (!exercise) return null;

  const targetMode = value.targetMode ?? null;
  if (targetMode !== null && !isOneOf(TARGET_MODES, targetMode)) return null;

  const { targets } = value;
  if (!Array.isArray(targets) || targets.length === 0 || targets.length > MAX_TRANSFER_SETS) {
    return null;
  }
  const allNull = targets.every((target) => target === null);
  const allValid = targets.every(
    (target) => typeof target === 'number' && validateTargetValue(target).ok,
  );
  if (!allNull && !allValid) return null;

  // A predefined exercise's tracking type is only known to the database, which checks it then.
  if ('custom' in exercise) {
    if (!validateExerciseConfig(exercise.custom.trackingType, targetMode).ok) return null;
    if (exercise.custom.trackingType === 'check' ? !allNull : !allValid) return null;
  }

  const board = value.board ?? null;
  if (board !== null && !validateBoard(board).ok) return null;

  return {
    exercise,
    targetMode,
    targets: targets as (number | null)[],
    board: board as TacticalBoard | null,
  };
}

/** Checks anything read from a file or a QR code and returns it as a `WorkoutTransfer`. */
export function parseWorkoutTransfer(value: unknown): ParseResult {
  if (!isRecord(value) || value.format !== TRANSFER_FORMAT) return invalid;
  if (typeof value.version !== 'number' || !Number.isInteger(value.version) || value.version < 1) {
    return invalid;
  }
  if (value.version > TRANSFER_VERSION) return { ok: false, reason: 'transfer_newer_version' };
  if (typeof value.name !== 'string' || value.name.trim() === '') return invalid;
  const { exercises } = value;
  if (
    !Array.isArray(exercises) ||
    exercises.length === 0 ||
    exercises.length > MAX_TRANSFER_EXERCISES
  ) {
    return invalid;
  }
  const parsed: TransferExercise[] = [];
  for (const item of exercises) {
    const exercise = parseExercise(item);
    if (!exercise) return invalid;
    parsed.push(exercise);
  }
  return {
    ok: true,
    transfer: {
      format: TRANSFER_FORMAT,
      version: TRANSFER_VERSION,
      name: value.name.trim(),
      exercises: parsed,
    },
  };
}

/** Text → a transfer (file contents), or `invalid_transfer`. */
export function parseWorkoutTransferText(text: string): ParseResult {
  try {
    return parseWorkoutTransfer(JSON.parse(text));
  } catch {
    return invalid;
  }
}

const BASE64_URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function toBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const chunk = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += BASE64_URL[(chunk >> 18) & 63] + BASE64_URL[(chunk >> 12) & 63];
    if (i + 1 < bytes.length) out += BASE64_URL[(chunk >> 6) & 63];
    if (i + 2 < bytes.length) out += BASE64_URL[chunk & 63];
  }
  return out;
}

function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) return null;
  const bytes = new Uint8Array(Math.floor((text.length * 3) / 4));
  let byte = 0;
  for (let i = 0; i < text.length; i += 4) {
    const values = [0, 1, 2, 3].map((k) => BASE64_URL.indexOf(text[i + k] ?? 'A'));
    const chunk = (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3];
    bytes[byte++] = (chunk >> 16) & 255;
    if (i + 2 < text.length) bytes[byte++] = (chunk >> 8) & 255;
    if (i + 3 < text.length) bytes[byte++] = chunk & 255;
  }
  return bytes;
}

/** JSON, deflated, as URL-safe text: what the QR link carries. */
export function encodeTransfer(transfer: WorkoutTransfer): string {
  return toBase64Url(deflateSync(strToU8(JSON.stringify(transfer)), { level: 9 }));
}

/** The reverse of `encodeTransfer`, checked like a file; text that isn't ours → `invalid_transfer`. */
export function decodeTransfer(encoded: string): ParseResult {
  const bytes = fromBase64Url(encoded);
  if (!bytes) return invalid;
  try {
    return parseWorkoutTransferText(strFromU8(inflateSync(bytes)));
  } catch {
    return invalid;
  }
}

/** The link for the QR code, or `null` when the workout is too big for one. */
export function qrLink(transfer: WorkoutTransfer): string | null {
  const link = TRANSFER_LINK_PREFIX + encodeTransfer(transfer);
  return link.length <= MAX_QR_LINK_LENGTH ? link : null;
}

/** The encoded part of a scanned link, or `null` when the text isn't one of ours. */
export function readQrLink(text: string): string | null {
  const trimmed = text.trim();
  return trimmed.startsWith(TRANSFER_LINK_PREFIX)
    ? trimmed.slice(TRANSFER_LINK_PREFIX.length)
    : null;
}
