/**
 * The predefined exercises' media, bundled with the app and read-only: one file per exercise in
 * `assets/exercises/`, named after its seed key (`free_throws.gif`). Metro only bundles static
 * `require`s, so every file needs its line here, e.g.
 *
 *   free_throws: { file: 'free_throws.gif', source: require('../../../assets/exercises/free_throws.gif') },
 *
 * `seedMedia.test.ts` fails, naming the file, when the folder and this list disagree. An exercise
 * with no entry shows the placeholder.
 */
export const SEED_MEDIA: Record<string, { file: string; source: number }> = {
  double_between_pickup: {
    file: 'double_between_pickup.mp4',
    source: require('../../../assets/exercises/double_between_pickup.mp4'),
  },
  form_shooting: {
    file: 'form_shooting.mp4',
    source: require('../../../assets/exercises/form_shooting.mp4'),
  },
  free_throws: {
    file: 'free_throws.mp4',
    source: require('../../../assets/exercises/free_throws.mp4'),
  },
  hang_dribble_pull_up: {
    file: 'hang_dribble_pull_up.mp4',
    source: require('../../../assets/exercises/hang_dribble_pull_up.mp4'),
  },
  in_and_out_crossover: {
    file: 'in_and_out_crossover.mp4',
    source: require('../../../assets/exercises/in_and_out_crossover.mp4'),
  },
  pull_up_jumpers: {
    file: 'pull_up_jumpers.mp4',
    source: require('../../../assets/exercises/pull_up_jumpers.mp4'),
  },
  same_foot_punch_extra_side_step: {
    file: 'same_foot_punch_extra_side_step.mp4',
    source: require('../../../assets/exercises/same_foot_punch_extra_side_step.mp4'),
  },
  snatches: {
    file: 'snatches.mp4',
    source: require('../../../assets/exercises/snatches.mp4'),
  },
  step_back_jumpers: {
    file: 'step_back_jumpers.mp4',
    source: require('../../../assets/exercises/step_back_jumpers.mp4'),
  },
  turn_fade: {
    file: 'turn_fade.mp4',
    source: require('../../../assets/exercises/turn_fade.mp4'),
  },
};
