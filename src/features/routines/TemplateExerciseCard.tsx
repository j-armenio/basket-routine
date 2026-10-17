import { ActionSheet } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ExerciseThumbnail } from '../exercises/ExerciseThumbnail';
import { TacticalBoardSlot } from '../tacticalBoard/TacticalBoardSlot';
import { SetTableHeader, modeSubtitle } from '../workout/SetTableHeader';
import { updateDraft } from './draftStore';
import { TemplateSetRow } from './TemplateSetRow';
import {
  addSet,
  moveExercise,
  removeExercise,
  setBoard,
  type DraftExercise,
} from './templateDraft';

type TemplateExerciseCardProps = {
  exercise: DraftExercise;
  index: number;
  count: number;
  /** Holding the header to drag the card and reorder: on activation, on every following move (the
   * finger's translation from there), and on release. See `DraggableExerciseList`. */
  onDragStart: () => void;
  onDragMove: (translationY: number) => void;
  onDragEnd: () => void;
};

/** An exercise of the template being edited: its sets hold targets only, nothing is logged. */
export function TemplateExerciseCard({
  exercise,
  index,
  count,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TemplateExerciseCardProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Holding the title starts a drag (a quick tap elsewhere in the header still reaches its own
  // buttons untouched); `runOnJS` because the move only ever touches plain JS state.
  const drag = Gesture.Pan()
    .activateAfterLongPress(400)
    .runOnJS(true)
    .onStart(onDragStart)
    .onUpdate((event) => onDragMove(event.translationY))
    .onFinalize(onDragEnd);

  const confirmRemove = () =>
    Alert.alert(
      t('workout.removeExerciseTitle'),
      t('workout.removeExerciseMessage', { name: exercise.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => updateDraft((draft) => removeExercise(draft, exercise.key)),
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
          onPress: () => updateDraft((draft) => setBoard(draft, exercise.key, null)),
        },
      ],
    );
  const move = (delta: -1 | 1) => updateDraft((draft) => moveExercise(draft, exercise.key, delta));

  return (
    <Card variant="compact" style={styles.card}>
      <View style={styles.header}>
        <ExerciseThumbnail exerciseId={exercise.exerciseId} name={exercise.name} />
        <GestureDetector gesture={drag}>
          <View style={styles.titles}>
            {/* A step smaller than the active workout's: the editor's header is busier. */}
            <AppText variant="body" weight="bold">
              {exercise.name}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {modeSubtitle(t, exercise.targetMode)}
            </AppText>
          </View>
        </GestureDetector>
        {exercise.tacticalBoard ? (
          <TacticalBoardSlot
            board={exercise.tacticalBoard}
            exerciseName={exercise.name}
            onOpen={() => router.push(`/tactical-board?draftKey=${exercise.key}`)}
            variant="icon"
          />
        ) : (
          <IconButton
            color={colors.iconMuted}
            icon="assignment_add"
            accessibilityLabel={t('workout.addBoardFor', { name: exercise.name })}
            onPress={() => router.push(`/tactical-board?draftKey=${exercise.key}`)}
          />
        )}
        <IconButton
          color={colors.iconMuted}
          icon="more_vert"
          accessibilityLabel={t('common.itemMenu', { name: exercise.name })}
          onPress={() => setMenuOpen(true)}
        />
      </View>
      <View style={styles.table}>
        <SetTableHeader targetMode={exercise.targetMode} hideLogged />
        {exercise.sets.map((set, position) => (
          <TemplateSetRow
            key={set.key}
            exerciseKey={exercise.key}
            set={set}
            number={position + 1}
            targetMode={exercise.targetMode}
            deletable={exercise.sets.length > 1}
          />
        ))}
      </View>
      <Button
        variant="ghost"
        icon="add"
        label={t('workout.addSet')}
        fullWidth
        onPress={() => updateDraft((draft) => addSet(draft, exercise.key))}
      />
      <ActionSheet
        visible={menuOpen}
        title={exercise.name}
        options={[
          {
            label: t('common.moveUp'),
            icon: 'arrow_upward',
            disabled: index === 0,
            onPress: () => move(-1),
          },
          {
            label: t('common.moveDown'),
            icon: 'arrow_downward',
            disabled: index === count - 1,
            onPress: () => move(1),
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
  // Like the active workout's card.
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
}));
