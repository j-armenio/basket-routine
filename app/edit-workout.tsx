import { BottomActionBar } from '@/components/BottomActionBar';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { saveWorkout } from '@/features/routines/actions';
import {
  closeDraft,
  openDraft,
  updateDraft,
  useDraft,
  useDraftDirty,
} from '@/features/routines/draftStore';
import { DraggableExerciseList } from '@/features/routines/DraggableExerciseList';
import { loadDraft, withRequestedExercise } from '@/features/routines/loadDraft';
import { rename, toSaveInput } from '@/features/routines/templateDraft';
import { leaveScreen } from '@/features/workout/navigation';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

const parseId = (value: string | undefined) => (value === undefined ? undefined : Number(value));

/**
 * The template editor: `?routineId=` creates a workout in that routine, `?workoutId=` edits one.
 * Edits live in the in-memory draft (see `draftStore`) until Save. Cancel drops them. Add to
 * Routine opens it with `?addExerciseId=` (and `?targetMode=`): the exercise is already appended,
 * unsaved.
 */
export default function EditWorkoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    routineId?: string;
    workoutId?: string;
    /** Add to Routine: the exercise to append, and its mode for a shooting drill. */
    addExerciseId?: string;
    targetMode?: string;
  }>();
  // Opens the draft while rendering for the first time, so the editor never renders without one.
  const [loaded] = useState(() => {
    const initial = loadDraft({
      workoutId: parseId(params.workoutId),
      routineId: parseId(params.routineId),
    });
    if (initial) {
      const requested = {
        exerciseId: parseId(params.addExerciseId),
        targetMode: params.targetMode,
      };
      openDraft(initial, withRequestedExercise(initial, requested));
    }
    return initial !== null;
  });
  const draft = useDraft();
  const dirty = useDraftDirty();
  // Set before the editor's own navigation (after Save or Discard). The guard's `dirty` comes from
  // the last render, so it would still block that navigation.
  const leaving = useRef(false);

  useEffect(() => closeDraft, []);

  usePreventRemove(dirty, ({ data }) => {
    if (leaving.current) {
      navigation.dispatch(data.action);
      return;
    }
    Alert.alert(t('routines.discardChangesTitle'), t('routines.discardChangesMessage'), [
      { text: t('routines.keepEditing'), style: 'cancel' },
      {
        text: t('workout.discard'),
        style: 'destructive',
        onPress: () => {
          leaving.current = true;
          navigation.dispatch(data.action);
        },
      },
    ]);
  });

  if (!loaded) {
    return (
      <Screen title={t('routines.editWorkoutTitle')} titleVariant="title" bottomInset>
        <EmptyState
          icon="sports_basketball"
          title={t('routines.notFoundTitle')}
          message={t('routines.notFoundMessage')}
          action={{ label: t('common.backToWorkout'), onPress: () => leaveScreen(router) }}
        />
      </Screen>
    );
  }
  // After Save the draft is closed while the screen is still on its way out.
  if (!draft) return null;

  const close = () => {
    leaving.current = true;
    closeDraft();
    leaveScreen(router);
  };

  const save = () => {
    // Nothing changed on an existing workout: no write. A new one always goes through the
    // repository, which says what is missing.
    if (draft.workoutId !== undefined && !dirty) {
      close();
      return;
    }
    const result = saveWorkout(toSaveInput(draft));
    if (result.ok) close();
    else Alert.alert(t('routines.saveFailedWorkoutTitle'), t(`errors.${result.reason}`));
  };

  return (
    <Screen
      title={t(
        draft.workoutId === undefined ? 'routines.newWorkoutTitle' : 'routines.editWorkoutTitle',
      )}
      titleVariant="title"
      left={
        <IconButton
          icon="close"
          accessibilityLabel={t('common.cancel')}
          onPress={() => leaveScreen(router)}
        />
      }
      footer={<BottomActionBar label={t('common.save')} onPress={save} />}
      bottomInset
      keyboardAvoiding
    >
      <TextField
        accessibilityLabel={t('routines.workoutNamePlaceholder')}
        placeholder={t('routines.workoutNamePlaceholder')}
        value={draft.name}
        onChangeText={(name) => updateDraft((current) => rename(current, name))}
        autoFocus={draft.workoutId === undefined}
        returnKeyType="done"
      />
      {draft.exercises.length === 0 ? (
        <EmptyState
          icon="sports_basketball"
          title={t('workout.emptyTitle')}
          message={t('routines.emptyExerciseMessage')}
        />
      ) : (
        <DraggableExerciseList exercises={draft.exercises} />
      )}
      <Button
        variant="secondary"
        icon="add"
        label={t('workout.addExercise')}
        fullWidth
        onPress={() => router.push('/add-exercise?to=template')}
      />
    </Screen>
  );
}
