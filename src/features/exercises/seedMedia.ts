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
  extended_hook: {
    file: 'extended_hook.mp4',
    source: require('../../../assets/exercises/extended_hook.mp4'),
  },
  floaters: {
    file: 'floaters.mp4',
    source: require('../../../assets/exercises/floaters.mp4'),
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
  inside_hand_layup: {
    file: 'inside_hand_layup.mp4',
    source: require('../../../assets/exercises/inside_hand_layup.mp4'),
  },
  jump_into_contact_layup: {
    file: 'jump_into_contact_layup.mp4',
    source: require('../../../assets/exercises/jump_into_contact_layup.mp4'),
  },
  layups: {
    file: 'layups.mp4',
    source: require('../../../assets/exercises/layups.mp4'),
  },
  pull_up_jumpers: {
    file: 'pull_up_jumpers.mp4',
    source: require('../../../assets/exercises/pull_up_jumpers.mp4'),
  },
  reverse_layups: {
    file: 'reverse_layups.mp4',
    source: require('../../../assets/exercises/reverse_layups.mp4'),
  },
  same_foot_punch_extra_side_step: {
    file: 'same_foot_punch_extra_side_step.mp4',
    source: require('../../../assets/exercises/same_foot_punch_extra_side_step.mp4'),
  },
  same_foot_same_hand_layup: {
    file: 'same_foot_same_hand_layup.mp4',
    source: require('../../../assets/exercises/same_foot_same_hand_layup.mp4'),
  },
  snatches: {
    file: 'snatches.mp4',
    source: require('../../../assets/exercises/snatches.mp4'),
  },
  step_back_jumpers: {
    file: 'step_back_jumpers.mp4',
    source: require('../../../assets/exercises/step_back_jumpers.mp4'),
  },
  switch_hand_reverse: {
    file: 'switch_hand_reverse.mp4',
    source: require('../../../assets/exercises/switch_hand_reverse.mp4'),
  },
  turn_fade: {
    file: 'turn_fade.mp4',
    source: require('../../../assets/exercises/turn_fade.mp4'),
  },
};
