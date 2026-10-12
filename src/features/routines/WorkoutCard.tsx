import { ActionSheet } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import type { WorkoutInRoutine } from '@/db/repositories/routines';
import { formatExerciseList } from '@/i18n/format';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { opacity, size, spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';
import { deleteWorkout } from './actions';

type WorkoutCardProps = {
  workout: WorkoutInRoutine;
  index: number;
  count: number;
  onStart: () => void;
  onEdit: () => void;
  onMove: (delta: -1 | 1) => void;
};

/** A template on the Workout tab: tap the body to edit it, the play button to begin a session from it. */
export function WorkoutCard({ workout, index, count, onStart, onEdit, onMove }: WorkoutCardProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const confirmDelete = () =>
    Alert.alert(t('routines.deleteTitle', { name: workout.name }), t('routines.historyStays'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteWorkout(workout.id) },
    ]);

  return (
    <Card variant="raised" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('routines.editName', { name: workout.name })}
        onPress={onEdit}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <AppText weight="bold" numberOfLines={1}>
          {workout.name}
        </AppText>
        <AppText variant="subtitle" tone="secondary">
          {formatExerciseList(
            t,
            workout.exercises.map((item) => item.exercise.name),
            workout.exercises.length,
          )}
        </AppText>
      </Pressable>
      <IconButton
        icon="more_vert"
        color={colors.iconMuted}
        accessibilityLabel={t('common.itemMenu', { name: workout.name })}
        onPress={() => setMenuOpen(true)}
      />
      <IconButton
        variant="play"
        icon="play_arrow"
        accessibilityLabel={t('routines.startName', { name: workout.name })}
        onPress={onStart}
      />
      <ActionSheet
        visible={menuOpen}
        title={workout.name}
        options={[
          { label: t('common.edit'), icon: 'edit', onPress: onEdit },
          {
            label: t('common.moveUp'),
            icon: 'arrow_upward',
            disabled: index === 0,
            onPress: () => onMove(-1),
          },
          {
            label: t('common.moveDown'),
            icon: 'arrow_downward',
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  body: {
    flex: 1,
    minHeight: size.minTouchTarget,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  pressed: {
    opacity: opacity.pressed,
  },
}));
