import { ActionSheet } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { fgTone } from '@/components/fgTone';
import { IconButton } from '@/components/IconButton';
import { fgBand } from '@/domain/fg';
import { formatFgPct } from '@/domain/format';
import { summarizeExercise } from '@/domain/summary';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { ExerciseThumbnail } from '../exercises/ExerciseThumbnail';
import { TacticalBoardSlot } from '../tacticalBoard/TacticalBoardSlot';
import { addSet, removeExercise, setBoard } from './actions';
import { CheckSetRow } from './CheckSetRow';
import { ExerciseNote } from './ExerciseNote';
import type { SessionExerciseDetail } from './hooks';
import { SetTableHeader, modeSubtitle } from './SetTableHeader';
import { ShootingSetRow } from './ShootingSetRow';

type ExerciseCardProps = {
  exercise: SessionExerciseDetail;
  index: number;
  count: number;
  onMove: (delta: -1 | 1) => void;
};

export function ExerciseCard({ exercise, index, count, onMove }: ExerciseCardProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { targetMode } = exercise;
  const summary = summarizeExercise(exercise);

  const confirmRemove = () =>
    Alert.alert(
      t('workout.removeExerciseTitle'),
      t('workout.removeExerciseMessage', { name: exercise.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => removeExercise(exercise.id),
        },
      ],
    );
  const confirmRemoveBoard = () =>
    Alert.alert(
      t('workout.removeBoardTitle'),
      t('workout.removeBoardMessage', { name: exercise.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => setBoard(exercise.id, null),
        },
      ],
    );

  return (
    <Card variant="compact" style={styles.card}>
      <View style={styles.header}>
        <ExerciseThumbnail exerciseId={exercise.exerciseId} name={exercise.name} />
        <View style={styles.titles}>
          <AppText variant="cardTitle">{exercise.name}</AppText>
          <AppText variant="caption" tone="secondary">
            {modeSubtitle(t, targetMode)}
          </AppText>
        </View>
        {!exercise.tacticalBoard && (
          <IconButton
            color={colors.iconMuted}
            icon="assignment_add"
            accessibilityLabel={t('workout.addBoardFor', { name: exercise.name })}
            onPress={() => router.push(`/tactical-board?sessionExerciseId=${exercise.id}`)}
          />
        )}
        <IconButton
          color={colors.iconMuted}
          icon="more_vert"
          accessibilityLabel={t('common.itemMenu', { name: exercise.name })}
          onPress={() => setMenuOpen(true)}
        />
      </View>
      <TacticalBoardSlot
        board={exercise.tacticalBoard}
        exerciseName={exercise.name}
        onOpen={() => router.push(`/tactical-board?sessionExerciseId=${exercise.id}`)}
      />
      <View style={styles.table}>
        <SetTableHeader targetMode={targetMode} />
        {exercise.sets.map((set, position) =>
          targetMode ? (
            <ShootingSetRow
              key={set.id}
              set={set}
              number={position + 1}
              targetMode={targetMode}
              deletable={exercise.sets.length > 1}
            />
          ) : (
            <CheckSetRow
              key={set.id}
              set={set}
              number={position + 1}
              deletable={exercise.sets.length > 1}
            />
          ),
        )}
      </View>
      {summary.trackingType === 'makes_attempts' && summary.attempts > 0 && (
        <AppText variant="bodySmall" tone="secondary" style={styles.total}>
          {t('workout.totalLabel', { makes: summary.makes, attempts: summary.attempts })} ·{' '}
          <AppText variant="bodySmall" weight="bold" tone={fgTone(fgBand(summary.fgPct))}>
            {formatFgPct(summary.fgPct)}
          </AppText>
        </AppText>
      )}
      <Button
        variant="ghostCompact"
        icon="add"
        label={t('workout.addSet')}
        fullWidth
        onPress={() => addSet(exercise.id)}
      />
      <ExerciseNote exerciseId={exercise.id} name={exercise.name} note={exercise.note} />
      <ActionSheet
        visible={menuOpen}
        title={exercise.name}
        options={[
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
          ...(exercise.tacticalBoard
            ? [
                {
                  label: t('workout.removeTacticalBoard'),
                  icon: 'layers_clear' as const,
                  destructive: true,
                  onPress: confirmRemoveBoard,
                },
              ]
            : []),
          {
            label: t('workout.removeExercise'),
            icon: 'delete',
            destructive: true,
            onPress: confirmRemove,
          },
        ]}
        onClose={() => setMenuOpen(false)}
      />
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  // The ⋮ button's own padding lines its icon up with the table's right edge.
  card: {
    paddingRight: spacing.md,
  },
  // The thumbnail, the titles and the icon buttons, centered on one line.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titles: {
    flex: 1,
    gap: spacing.xxs,
  },
  table: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  total: {
    paddingTop: spacing.xs,
  },
}));
