import { EmptyState } from '@/components/EmptyState';
import { Fab, FAB_CLEARANCE } from '@/components/Fab';
import { IconButton } from '@/components/IconButton';
import { NameDialog } from '@/components/NameDialog';
import { Screen } from '@/components/Screen';
import type { RoutineWithWorkouts } from '@/db/repositories/routines';
import type { DomainErrorReason } from '@/domain/errors';
import { moveItem } from '@/domain/order';
import { spacing } from '@/theme/spacing';
import { createRoutine, moveRoutine, renameRoutine } from '@/features/routines/actions';
import { useRoutines } from '@/features/routines/hooks';
import { RoutineCarousel } from '@/features/routines/RoutineCarousel';
import { RoutineWorkouts } from '@/features/routines/RoutineWorkouts';
import {
  discardAndStartFromTemplate,
  startEmptyWorkout,
  startWorkoutFromTemplate,
} from '@/features/workout/actions';
import { useInProgressSession } from '@/features/workout/hooks';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';

type Dialog = { kind: 'new' } | { kind: 'rename'; routine: RoutineWithWorkouts };

export default function WorkoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useInProgressSession();
  const routines = useRoutines();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  // The routine whose workouts show. Nothing is stored: the tab opens on the first routine, and a
  // routine that no longer exists (deleted) falls back to it too.
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedIndex = Math.max(
    0,
    routines.findIndex((routine) => routine.id === selectedId),
  );
  const selected = routines.at(selectedIndex);

  const startEmpty = () => {
    if (startEmptyWorkout().ok) router.push('/active-workout');
  };

  const openActiveWorkout = (started: { ok: boolean }) => {
    if (started.ok) router.push('/active-workout');
  };
  const showFailure = (reason: DomainErrorReason) =>
    Alert.alert(t('routines.startFailedTitle'), t(`errors.${reason}`));

  const startTemplate = (workoutId: number, workoutName: string) => {
    if (!session) {
      const result = startWorkoutFromTemplate(workoutId);
      if (result.ok) openActiveWorkout(result);
      else showFailure(result.reason);
      return;
    }
    Alert.alert(
      t('workout.inProgress'),
      t('routines.sessionInProgressMessage', { current: session.name, next: workoutName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('routines.resume'), onPress: () => router.push('/active-workout') },
        {
          text: t('routines.discardAndStart'),
          style: 'destructive',
          onPress: () => {
            const result = discardAndStartFromTemplate(workoutId);
            if (result.ok) openActiveWorkout(result);
            else showFailure(result.reason);
          },
        },
      ],
    );
  };

  const showSaveFailure = (reason: DomainErrorReason) =>
    Alert.alert(t('routines.saveRoutineFailedTitle'), t(`errors.${reason}`));

  const confirmDialog = (name: string) => {
    const current = dialog;
    setDialog(null);
    if (current?.kind === 'rename') {
      const result = renameRoutine(current.routine.id, name);
      if (!result.ok) showSaveFailure(result.reason);
      return;
    }
    const result = createRoutine(name);
    if (result.ok) setSelectedId(result.value.id);
    else showSaveFailure(result.reason);
  };

  return (
    <Screen
      title={t('tabs.workout')}
      // Rarely needed, so a plain button up here; with no routine yet, the empty state has its own.
      right={
        routines.length > 0 ? (
          <IconButton
            icon="add"
            variant="outlined"
            accessibilityLabel={t('routines.newRoutine')}
            onPress={() => setDialog({ kind: 'new' })}
          />
        ) : undefined
      }
      scroll={false}
    >
      {selected === undefined ? (
        <EmptyState
          icon="sports_basketball"
          title={t('routines.emptyTitle')}
          message={t('routines.emptyMessage')}
          action={{ label: t('routines.newRoutine'), onPress: () => setDialog({ kind: 'new' }) }}
        />
      ) : (
        <>
          <RoutineCarousel
            routines={routines}
            index={selectedIndex}
            onSelect={(index) => setSelectedId(routines[index].id)}
            onRename={() => setDialog({ kind: 'rename', routine: selected })}
            onMove={(delta) => {
              // Pinned, so the carousel keeps showing it as it moves, even if it was only the default.
              setSelectedId(selected.id);
              moveRoutine(
                moveItem(
                  routines.map((routine) => routine.id),
                  selectedIndex,
                  delta,
                ),
              );
            }}
          />
          <ScrollView
            style={styles.workouts}
            contentContainerStyle={styles.workoutsContent}
            keyboardShouldPersistTaps="handled"
          >
            <RoutineWorkouts
              routine={selected}
              onNewWorkout={() =>
                router.push({ pathname: '/edit-workout', params: { routineId: selected.id } })
              }
              onEditWorkout={(workoutId) =>
                router.push({ pathname: '/edit-workout', params: { workoutId } })
              }
              onStartWorkout={(workoutId) =>
                startTemplate(
                  workoutId,
                  selected.workouts.find((workout) => workout.id === workoutId)?.name ?? '',
                )
              }
            />
          </ScrollView>
        </>
      )}
      {/* Resuming a running workout is the banner's job, above the tab bar. */}
      {!session && <Fab label={t('routines.startEmptyWorkout')} icon="add" onPress={startEmpty} />}
      <NameDialog
        visible={dialog !== null}
        title={t(dialog?.kind === 'rename' ? 'routines.renameRoutineTitle' : 'routines.newRoutine')}
        initialName={dialog?.kind === 'rename' ? dialog.routine.name : ''}
        confirmLabel={t(dialog?.kind === 'rename' ? 'common.save' : 'routines.create')}
        onConfirm={confirmDialog}
        onClose={() => setDialog(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  workouts: {
    flex: 1,
  },
  workoutsContent: {
    paddingTop: spacing.xs,
    paddingBottom: FAB_CLEARANCE,
  },
});
