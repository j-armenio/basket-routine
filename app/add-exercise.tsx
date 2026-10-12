import { Fab, FAB_CLEARANCE } from '@/components/Fab';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import type { Exercise } from '@/db/types';
import type { TargetMode } from '@/domain/types';
import { ExerciseList } from '@/features/exercises/ExerciseList';
import { useExercises } from '@/features/exercises/hooks';
import { getDraft, updateDraft } from '@/features/routines/draftStore';
import { addExercise as addToTemplate } from '@/features/routines/templateDraft';
import { addExercise } from '@/features/workout/actions';
import { useInProgressSession } from '@/features/workout/hooks';
import { TargetModeSheet } from '@/features/workout/TargetModeSheet';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export default function AddExerciseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  // `?to=template` adds to the template being edited instead of the session in progress.
  const { to } = useLocalSearchParams<{ to?: string }>();
  const toTemplate = to === 'template';
  const session = useInProgressSession();
  // Redirects only when it mounts with nothing to add to (see the active workout).
  const [mountedWithTarget] = useState(toTemplate ? getDraft() !== null : session !== undefined);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Exercise | null>(null);

  // Follows the data version: an exercise created from here shows up on return.
  const sections = useExercises({ search });

  if (!toTemplate && !session) return mountedWithTarget ? null : <Redirect href="/" />;
  if (toTemplate && !mountedWithTarget) return <Redirect href="/" />;

  const add = (exercise: Exercise, targetMode?: TargetMode) => {
    if (toTemplate) {
      updateDraft((draft) => addToTemplate(draft, exercise, targetMode ?? null));
      router.back();
      return;
    }
    if (!session) return;
    const result = addExercise(session.id, exercise.id, targetMode);
    if (result.ok) router.back();
    else Alert.alert(t('addExercise.addFailedTitle'), t(`errors.${result.reason}`));
  };

  const pick = (exercise: Exercise) => {
    if (exercise.trackingType === 'check') add(exercise);
    else setPending(exercise);
  };

  return (
    <Screen
      title={t('addExercise.title')}
      titleVariant="title"
      scroll={false}
      bottomInset
      left={
        <IconButton
          icon="close"
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
        />
      }
    >
      <TextField
        icon="search"
        accessibilityLabel={t('common.searchExercises')}
        placeholder={t('common.searchExercises')}
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        returnKeyType="search"
      />
      <ExerciseList
        sections={sections}
        rightIcon="add"
        bottomClearance={FAB_CLEARANCE}
        onPressExercise={pick}
      />
      <Fab
        label={t('addExercise.newExerciseLabel')}
        icon="add"
        accessibilityLabel={t('addExercise.newExerciseA11y')}
        onPress={() => router.push('/edit-exercise')}
      />
      <TargetModeSheet
        exerciseName={pending?.name ?? null}
        onPick={(targetMode) => pending && add(pending, targetMode)}
        onClose={() => setPending(null)}
      />
    </Screen>
  );
}
