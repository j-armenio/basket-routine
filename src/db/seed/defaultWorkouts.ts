import type { WorkoutTransfer } from '@/domain/workoutTransfer';

/** The routine the starter workouts go into. */
export const DEFAULT_ROUTINE_NAME = 'Starter Routine';

const FORMAT = 'basket-routine/workout' as const;

// Exports of two workouts, in the format Export file writes (`src/domain/workoutTransfer.ts`), so
// a better version can be exported from the app and pasted here as it is.
export const DEFAULT_WORKOUTS: WorkoutTransfer[] = [
  {
    format: FORMAT,
    version: 1,
    name: 'Off the dribble shooting',
    exercises: [
      {
        exercise: { seedKey: 'form_shooting' },
        targetMode: 'makes',
        targets: [5, 5, 5],
        board: {
          version: 1,
          elements: [
            { type: 'x', at: [0.371, 0.131] },
            { type: 'x', at: [0.498, 0.25] },
            { type: 'x', at: [0.634, 0.132] },
          ],
        },
      },
      {
        exercise: { seedKey: 'double_between_pickup' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: {
          version: 1,
          elements: [
            { type: 'x', at: [0.34, 0.372] },
            { type: 'x', at: [0.649, 0.378] },
          ],
        },
      },
      {
        exercise: { seedKey: 'pull_up_jumpers' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: {
          version: 1,
          elements: [
            { type: 'x', at: [0.503, 0.562] },
            { type: 'arrow', from: [0.555, 0.552], to: [0.641, 0.43], via: [0.605, 0.503] },
            { type: 'arrow', from: [0.446, 0.55], to: [0.358, 0.431], via: [0.408, 0.521] },
            { type: 'x', at: [0.68, 0.394] },
            { type: 'x', at: [0.331, 0.39] },
          ],
        },
      },
      {
        exercise: { seedKey: 'step_back_jumpers' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: {
          version: 1,
          elements: [
            { type: 'x', at: [0.499, 0.555] },
            {
              type: 'pen',
              points: [
                [0.559, 0.523],
                [0.601, 0.452],
                [0.618, 0.372],
                [0.649, 0.432],
              ],
            },
            {
              type: 'pen',
              points: [
                [0.441, 0.531],
                [0.4, 0.487],
                [0.391, 0.469],
                [0.378, 0.379],
                [0.342, 0.441],
              ],
            },
            { type: 'x', at: [0.331, 0.444] },
            { type: 'x', at: [0.673, 0.449] },
          ],
        },
      },
      {
        exercise: { seedKey: 'snatches' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: {
          version: 1,
          elements: [
            { type: 'x', at: [0.496, 0.569] },
            {
              type: 'pen',
              points: [
                [0.468, 0.546],
                [0.417, 0.507],
                [0.379, 0.465],
                [0.354, 0.415],
                [0.349, 0.379],
                [0.321, 0.465],
              ],
            },
            {
              type: 'pen',
              points: [
                [0.549, 0.556],
                [0.597, 0.524],
                [0.627, 0.493],
                [0.681, 0.379],
                [0.673, 0.45],
                [0.676, 0.477],
              ],
            },
            { type: 'x', at: [0.307, 0.453] },
            { type: 'x', at: [0.69, 0.471] },
          ],
        },
      },
      {
        exercise: { seedKey: 'hang_dribble_pull_up' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: {
          version: 1,
          elements: [
            { type: 'x', at: [0.503, 0.558] },
            { type: 'arrow', from: [0.464, 0.527], to: [0.357, 0.418], via: [0.407, 0.493] },
            { type: 'arrow', from: [0.552, 0.528], to: [0.635, 0.421], via: [0.616, 0.489] },
            { type: 'x', at: [0.336, 0.412] },
            { type: 'x', at: [0.67, 0.402] },
          ],
        },
      },
      {
        exercise: { seedKey: 'in_and_out_crossover' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: null,
      },
      {
        exercise: { seedKey: 'same_foot_punch_extra_side_step' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: null,
      },
      {
        exercise: { seedKey: 'turn_fade' },
        targetMode: 'attempts',
        targets: [10, 10],
        board: null,
      },
      {
        exercise: { seedKey: 'free_throws' },
        targetMode: 'attempts',
        targets: [20],
        board: null,
      },
    ],
  },
  {
    format: FORMAT,
    version: 1,
    name: 'Finishing',
    exercises: [
      { exercise: { seedKey: 'layups' }, targetMode: 'makes', targets: [5, 5], board: null },
      {
        exercise: { seedKey: 'inside_hand_layup' },
        targetMode: 'makes',
        targets: [5, 5],
        board: null,
      },
      {
        exercise: { seedKey: 'same_foot_same_hand_layup' },
        targetMode: 'makes',
        targets: [5, 5],
        board: null,
      },
      {
        exercise: { seedKey: 'jump_into_contact_layup' },
        targetMode: 'makes',
        targets: [4, 4],
        board: null,
      },
      {
        exercise: { seedKey: 'switch_hand_reverse' },
        targetMode: 'makes',
        targets: [5, 5],
        board: null,
      },
      {
        exercise: { seedKey: 'reverse_layups' },
        targetMode: 'makes',
        targets: [5, 5],
        board: null,
      },
      { exercise: { seedKey: 'floaters' }, targetMode: 'makes', targets: [5, 5], board: null },
      {
        exercise: { seedKey: 'extended_hook' },
        targetMode: 'makes',
        targets: [5, 5],
        board: null,
      },
    ],
  },
];
