import { ActionSheet } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import type { RoutineWithWorkouts } from '@/db/repositories/routines';
import { moveItem } from '@/domain/order';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { deleteRoutine, moveWorkout } from './actions';
import { WorkoutCard } from './WorkoutCard';

type RoutineSectionProps = {
  routine: RoutineWithWorkouts;
  index: number;
  count: number;
  onRename: () => void;
  onMove: (delta: -1 | 1) => void;
  onNewWorkout: () => void;
  onEditWorkout: (workoutId: number) => void;
  onStartWorkout: (workoutId: number) => void;
};

/**
 * The selected routine on the Workout tab: its name and menu (it moves left or right among the
 * routine chips from there), its workout cards (or a line saying there is none) and "New Workout".
 */
export function RoutineSection({
  routine,
  index,
  count,
  onRename,
  onMove,
  onNewWorkout,
  onEditWorkout,
  onStartWorkout,
}: RoutineSectionProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const workoutIds = routine.workouts.map((workout) => workout.id);
  const n = workoutIds.length;

  const confirmDelete = () =>
    Alert.alert(
      t('routines.deleteTitle', { name: routine.name }),
      n === 0 ? t('routines.historyStays') : t('routines.deleteRoutineMessage', { count: n }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteRoutine(routine.id),
        },
      ],
    );

  return (
    <Card style={styles.section}>
      <View style={styles.header}>
        <AppText
          variant="sectionTitle"
          accessibilityRole="header"
          numberOfLines={1}
          style={styles.name}
        >
          {routine.name}
        </AppText>
        <IconButton
          icon="more_vert"
          color={colors.iconMuted}
          accessibilityLabel={t('common.itemMenu', { name: routine.name })}
          onPress={() => setMenuOpen(true)}
        />
      </View>
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
      <ActionSheet
        visible={menuOpen}
        title={routine.name}
        options={[
          { label: t('routines.rename'), icon: 'edit', onPress: onRename },
          {
            label: t('common.moveLeft'),
            icon: 'arrow_back',
            disabled: index === 0,
            onPress: () => onMove(-1),
          },
          {
            label: t('common.moveRight'),
            icon: 'arrow_forward',
            disabled: index === count - 1,
            onPress: () => onMove(1),
          },
          { label: t('common.delete'), icon: 'delete', destructive: true, onPress: confirmDelete },
        ]}
        onClose={() => setMenuOpen(false)}
      />
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.smPlus,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
  },
  name: {
    flex: 1,
  },
  empty: {
    paddingHorizontal: spacing.sm,
  },
}));
