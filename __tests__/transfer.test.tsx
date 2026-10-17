import { createRoutine } from '@/db/repositories/routines';
import { getWorkoutWithExercises, listWorkouts, saveWorkout } from '@/db/repositories/workouts';
import { exercises, routines, sessions, workouts } from '@/db/schema';
import { useDatabaseSetup } from '@/db/useDatabaseSetup';
import type { Db } from '@/db/types';
import {
  parseWorkoutTransferText,
  qrLink,
  toWorkoutTransfer,
  type WorkoutTransfer,
} from '@/domain/workoutTransfer';
import { notifyDataChanged } from '@/features/dataStore';
import { closeDraft } from '@/features/routines/draftStore';
import { expectAccessibleControls } from '@/test-utils/a11y';
import { act, cleanup, fireEvent, screen, userEvent } from '@testing-library/react-native';
import { eq } from 'drizzle-orm';
import { getDocumentAsync } from 'expo-document-picker';
import { renderRouter } from 'expo-router/testing-library';
import { shareAsync } from 'expo-sharing';
import { Alert } from 'react-native';

// Exporting a workout (file, QR code) and importing one (file, QR scan), end to end on a real
// in-memory DB. The file system, share sheet, document picker and camera are the mocks of
// `jest.setup.js`.
jest.mock('@/db/client', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { createTestDb } = require('@/db/test-utils');
  const { seedExercises } = require('@/db/seed/seed');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const db = createTestDb();
  seedExercises(db);
  return { db };
});
jest.mock('@/db/useDatabaseSetup', () => ({ useDatabaseSetup: jest.fn() }));

jest.setTimeout(30_000);

const { db } = jest.requireMock('@/db/client') as { db: Db };
const contents = (jest.requireMock('expo-file-system') as { __contents: Map<string, string> })
  .__contents;

const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

beforeEach(() => {
  jest.mocked(useDatabaseSetup).mockReturnValue({ ready: true, error: null });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.mocked(shareAsync).mockClear();
});

afterEach(async () => {
  await cleanup();
  jest.mocked(getDocumentAsync).mockReset();
  jest.mocked(getDocumentAsync).mockResolvedValue({ canceled: true, assets: null });
  contents.clear();
  closeDraft();
  db.delete(sessions).run();
  db.delete(workouts).run();
  db.delete(routines).run();
  notifyDataChanged();
});

async function launch() {
  const rendered = renderRouter('./app');
  await rendered;
  return { getPathname: () => rendered.getPathname() };
}

const exerciseId = (seedKey: string) =>
  db.select().from(exercises).where(eq(exercises.seedKey, seedKey)).get()!.id;

function seedRoutine(name = 'Push') {
  const routine = createRoutine(db, name);
  const workout = saveWorkout(db, {
    routineId: routine.id,
    name: 'Shooting day',
    exercises: [
      {
        exerciseId: exerciseId('free_throws'),
        targetMode: 'attempts',
        targetValues: [10, 10],
        tacticalBoard: { version: 1, elements: [{ type: 'x', at: [0.25, 0.5] }] },
      },
      { exerciseId: exerciseId('figure_8'), targetMode: null, targetValues: [null] },
    ],
  });
  notifyDataChanged();
  return { routine, workout };
}

/** A transfer of a workout nobody has here: a custom drill plus a predefined exercise. */
const incoming = (): WorkoutTransfer => ({
  format: 'basket-routine/workout',
  version: 1,
  name: 'From a friend',
  exercises: [
    {
      exercise: { seedKey: 'free_throws' },
      targetMode: 'makes',
      targets: [5],
      board: null,
    },
    {
      exercise: {
        custom: {
          name: 'Wall passes',
          category: 'ball_handling',
          trackingType: 'check',
          description: '',
        },
      },
      targetMode: null,
      targets: [null],
      board: null,
    },
  ],
});

const pickFile = (text: string) => {
  contents.set('file:///cache/incoming.json', text);
  jest.mocked(getDocumentAsync).mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///cache/incoming.json', name: 'incoming.json', lastModified: 0 }],
  });
};

async function openImport(user: ReturnType<typeof setupUser>, routineName: string) {
  await user.press(screen.getByRole('button', { name: `${routineName} menu` }));
  await user.press(screen.getByRole('button', { name: 'Import workout' }));
}

describe('exporting a workout', () => {
  test('the card menu shares the template as a .json file', async () => {
    seedRoutine();
    await launch();
    const user = setupUser();

    await user.press(screen.getByRole('button', { name: 'Shooting day menu' }));
    expectAccessibleControls();
    await user.press(screen.getByRole('button', { name: 'Export file' }));

    expect(shareAsync).toHaveBeenCalledTimes(1);
    const [uri, options] = jest.mocked(shareAsync).mock.calls[0];
    expect(uri).toMatch(/\/transfer\/shooting-day\.json$/);
    expect(options).toMatchObject({ mimeType: 'application/json' });
    const parsed = parseWorkoutTransferText(contents.get(uri)!);
    expect(parsed.ok && parsed.transfer.name).toBe('Shooting day');
    expect(parsed.ok && parsed.transfer.exercises.map((e) => e.exercise)).toEqual([
      { seedKey: 'free_throws' },
      { seedKey: 'figure_8' },
    ]);
  });

  test('the card menu shows the workout as a QR code', async () => {
    seedRoutine();
    const app = await launch();
    const user = setupUser();

    await user.press(screen.getByRole('button', { name: 'Shooting day menu' }));
    await user.press(screen.getByRole('button', { name: 'Show QR code' }));

    expect(app.getPathname()).toBe('/workout-qr');
    expect(screen.getByLabelText('QR code of Shooting day')).toBeOnTheScreen();
    expect(screen.getByText(/Import workout, Scan QR code/)).toBeOnTheScreen();
    expectAccessibleControls();
  });
});

describe('importing a workout', () => {
  test('from a file: preview, choose the routine, import, and the editor opens on it', async () => {
    const { routine } = seedRoutine('Push');
    const legs = createRoutine(db, 'Legs');
    notifyDataChanged();
    pickFile(JSON.stringify(incoming()));
    const app = await launch();
    const user = setupUser();

    await openImport(user, 'Push');
    expect(app.getPathname()).toBe('/import-workout');
    expectAccessibleControls();
    await user.press(screen.getByRole('button', { name: 'Choose file' }));

    expect(screen.getByText('From a friend')).toBeOnTheScreen();
    expect(screen.getByText('Free Throws')).toBeOnTheScreen();
    expect(screen.getByText('Wall passes')).toBeOnTheScreen();
    expect(screen.getByText('1 custom exercise will be created.')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Push' })).toBeSelected();
    expectAccessibleControls();

    await user.press(screen.getByRole('radio', { name: 'Legs' }));
    await user.press(screen.getByRole('button', { name: 'Import' }));

    expect(app.getPathname()).toBe('/edit-workout');
    const [imported] = listWorkouts(db, legs.id);
    expect(imported.name).toBe('From a friend');
    expect(listWorkouts(db, routine.id)).toHaveLength(1);
    const saved = getWorkoutWithExercises(db, imported.id)!;
    expect(saved.exercises.map((e) => e.exercise.name)).toEqual(['Free Throws', 'Wall passes']);
    expect(saved.exercises[1].exercise.isCustom).toBe(true);
    expect(screen.getByDisplayValue('From a friend')).toBeOnTheScreen();
  });

  test('a file that is not a workout says so and stays on the first step', async () => {
    const { routine } = seedRoutine();
    await launch();
    const user = setupUser();
    pickFile('this is not json');

    await openImport(user, 'Push');
    await user.press(screen.getByRole('button', { name: 'Choose file' }));

    expect(screen.getByText("That isn't a workout from Basket Routine.")).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Choose file' })).toBeOnTheScreen();
    expect(listWorkouts(db, routine.id)).toHaveLength(1);
  });

  test('a file from a newer version of the app is told apart', async () => {
    seedRoutine();
    await launch();
    const user = setupUser();
    pickFile(JSON.stringify({ ...incoming(), version: 2 }));

    await openImport(user, 'Push');
    await user.press(screen.getByRole('button', { name: 'Choose file' }));

    expect(screen.getByText(/comes from a newer version/)).toBeOnTheScreen();
  });

  test('by QR: a code that is not ours is ignored, the right one opens the preview', async () => {
    const { routine } = seedRoutine();
    await launch();
    const user = setupUser();
    const link = qrLink(incoming())!;

    await openImport(user, 'Push');
    await user.press(screen.getByRole('button', { name: 'Scan QR code' }));
    expect(screen.getByText('Point the camera at the QR code.')).toBeOnTheScreen();
    expectAccessibleControls();

    await fireEvent(screen.getByTestId('camera'), 'barcodeScanned', {
      data: 'https://example.com',
    });
    expect(screen.getByText("That isn't a workout from Basket Routine.")).toBeOnTheScreen();

    await fireEvent(screen.getByTestId('camera'), 'barcodeScanned', { data: link });
    expect(screen.getByText('From a friend')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Import' }));
    expect(listWorkouts(db, routine.id).map((w) => w.name)).toEqual([
      'Shooting day',
      'From a friend',
    ]);
  });

  test('a workout round-trips through the QR link', async () => {
    const { workout } = seedRoutine('Push');
    const legs = createRoutine(db, 'Legs');
    notifyDataChanged();
    const link = qrLink(toWorkoutTransfer(getWorkoutWithExercises(db, workout.id)!))!;
    await launch();
    const user = setupUser();

    await openImport(user, 'Push');
    await user.press(screen.getByRole('button', { name: 'Scan QR code' }));
    await fireEvent(screen.getByTestId('camera'), 'barcodeScanned', { data: link });
    await user.press(screen.getByRole('radio', { name: 'Legs' }));
    await user.press(screen.getByRole('button', { name: 'Import' }));

    const [copy] = listWorkouts(db, legs.id);
    const original = getWorkoutWithExercises(db, workout.id)!;
    const imported = getWorkoutWithExercises(db, copy.id)!;
    expect(imported.exercises.map((e) => [e.exerciseId, e.targetMode, e.tacticalBoard])).toEqual(
      original.exercises.map((e) => [e.exerciseId, e.targetMode, e.tacticalBoard]),
    );
    expect(imported.exercises.map((e) => e.sets.map((s) => s.targetValue))).toEqual([
      [10, 10],
      [null],
    ]);
  });

  test('without a routine, it asks for one first', async () => {
    await launch();
    // the Workout tab has no routine menu then: open the screen straight away
    await act(async () => {
      jest.requireActual('expo-router').router.push('/import-workout');
    });
    expect(screen.getByText('Create a routine first')).toBeOnTheScreen();
    expectAccessibleControls();
  });
});
