import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import type { RoutineWithWorkouts } from '@/db/repositories/routines';
import { formatExerciseList } from '@/i18n/format';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { opacity, radius, size, spacing } from '@/theme/spacing';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

type RoutineChoiceSectionProps = {
  routine: RoutineWithWorkouts;
  onPickWorkout: (workoutId: number) => void;
  onNewWorkout: () => void;
};

/**
 * A routine in the Add to Routine chooser, laid out like its section on the Workout tab: its
 * workouts to pick from, and "New Workout".
 */
export function RoutineChoiceSection({
  routine,
  onPickWorkout,
  onNewWorkout,
}: RoutineChoiceSectionProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <Card style={styles.section}>
      <AppText
        variant="sectionTitle"
        accessibilityRole="header"
        numberOfLines={1}
        style={styles.name}
      >
        {routine.name}
      </AppText>
      {routine.workouts.length === 0 && (
        <AppText variant="bodySmall" tone="secondary" style={styles.name}>
          {t('routines.noWorkoutsInRoutine')}
        </AppText>
      )}
      {routine.workouts.map((workout) => (
        <Pressable
          key={workout.id}
          accessibilityRole="button"
          accessibilityLabel={t('routines.addToWorkout', { name: workout.name })}
          onPress={() => onPickWorkout(workout.id)}
          style={({ pressed }) => [styles.workout, pressed && styles.pressed]}
        >
          <View style={styles.texts}>
            <AppText weight="bold" numberOfLines={1}>
              {workout.name}
            </AppText>
            <AppText variant="subtitle" tone="secondary" numberOfLines={2}>
              {formatExerciseList(
                t,
                workout.exercises.map((item) => item.exercise.name),
              )}
            </AppText>
          </View>
          <Icon name="add" size={size.icon} color={colors.primary} />
        </Pressable>
      ))}
      <Button
        variant="dashed"
        icon="add"
        label={t('routines.newWorkout')}
        accessibilityLabel={t('routines.newWorkoutIn', { name: routine.name })}
        fullWidth
        onPress={onNewWorkout}
      />
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.smPlus,
  },
  name: {
    paddingHorizontal: spacing.sm,
  },
  workout: {
    minHeight: size.buttonPrimaryHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    borderRadius: radius.button,
    backgroundColor: colors.surfaceRaised,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
}));
