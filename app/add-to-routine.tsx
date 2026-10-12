import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import type { TargetMode } from '@/domain/types';
import { useExercise } from '@/features/exercises/hooks';
import { useRoutines } from '@/features/routines/hooks';
import { RoutineChoiceSection } from '@/features/routines/RoutineChoiceSection';
import { TargetModeSheet } from '@/features/workout/TargetModeSheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Destination = { workoutId: number } | { routineId: number };

/**
 * Add to Routine, from an exercise's detail: pick a workout (or "New Workout" in a routine) and,
 * for a shooting drill, what it fixes. The template editor then opens with the exercise already
 * added at the end, so the targets are set and saved there, like any template change.
 */
export default function AddToRoutineScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const exercise = useExercise(Number(exerciseId));
  const routines = useRoutines();
  const [pending, setPending] = useState<Destination | null>(null);
  const close = (
    <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={() => router.back()} />
  );

  if (!exercise) {
    return (
      <Screen title={t('addToRoutine.title')} titleVariant="title" left={close} bottomInset>
        <EmptyState
          icon="sports_basketball"
          title={t('addToRoutine.notFoundTitle')}
          message={t('addToRoutine.notFoundMessage')}
          action={{ label: t('common.back'), onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const open = (destination: Destination, targetMode?: TargetMode) => {
    const params = {
      ...('workoutId' in destination
        ? { workoutId: destination.workoutId }
        : { routineId: destination.routineId }),
      addExerciseId: exercise.id,
      ...(targetMode ? { targetMode } : {}),
    };
    // The editor takes this screen's place: its Cancel and Save land back on the exercise.
    router.replace({ pathname: '/edit-workout', params });
  };

  const pick = (destination: Destination) => {
    if (exercise.trackingType === 'check') open(destination);
    else setPending(destination);
  };

  return (
    <Screen
      title={t('addToRoutine.title')}
      titleVariant="title"
      subtitle={exercise.name}
      left={close}
      bottomInset
    >
      {routines.length === 0 ? (
        <EmptyState
          icon="sports_basketball"
          title={t('addToRoutine.emptyTitle')}
          message={t('addToRoutine.emptyMessage')}
        />
      ) : (
        routines.map((routine) => (
          <RoutineChoiceSection
            key={routine.id}
            routine={routine}
            onPickWorkout={(workoutId) => pick({ workoutId })}
            onNewWorkout={() => pick({ routineId: routine.id })}
          />
        ))
      )}
      <TargetModeSheet
        exerciseName={pending ? exercise.name : null}
        onPick={(targetMode) => pending && open(pending, targetMode)}
        onClose={() => setPending(null)}
      />
    </Screen>
  );
}
