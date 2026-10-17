import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import type { RoutineWithWorkouts } from '@/db/repositories/routines';
import { moveItem } from '@/domain/order';
import { spacing } from '@/theme/spacing';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { moveWorkout } from './actions';
import { WorkoutCard } from './WorkoutCard';

type RoutineWorkoutsProps = {
  routine: RoutineWithWorkouts;
  onNewWorkout: () => void;
  onEditWorkout: (workoutId: number) => void;
  onShowQr: (workoutId: number) => void;
  onStartWorkout: (workoutId: number) => void;
};

/**
 * The routine shown on the Workout tab: its workout cards (or a line saying there is none) and
 * "New Workout". Its name and menu are the `RoutineCarousel`'s, above.
 */
export function RoutineWorkouts({
  routine,
  onNewWorkout,
  onEditWorkout,
  onShowQr,
  onStartWorkout,
}: RoutineWorkoutsProps) {
  const { t } = useTranslation();
  const workoutIds = routine.workouts.map((workout) => workout.id);
  const n = workoutIds.length;

  return (
    <View style={styles.list}>
      {n === 0 && (
        <AppText variant="bodySmall" tone="secondary" style={styles.empty}>
          {t('routines.noWorkoutsInRoutine')}
        </AppText>
      )}
      {routine.workouts.map((workout, position) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          index={position}
          count={n}
          onStart={() => onStartWorkout(workout.id)}
          onEdit={() => onEditWorkout(workout.id)}
          onShowQr={() => onShowQr(workout.id)}
          onMove={(delta) => moveWorkout(routine.id, moveItem(workoutIds, position, delta))}
        />
      ))}
      <Button
        variant="dashed"
        icon="add"
        label={t('routines.newWorkout')}
        accessibilityLabel={t('routines.newWorkoutIn', { name: routine.name })}
        fullWidth
        onPress={onNewWorkout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.itemGap,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
