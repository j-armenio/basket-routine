import { BottomActionBar } from '@/components/BottomActionBar';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { haptics } from '@/components/haptics';
import { Screen } from '@/components/Screen';
import {
  discardWorkout,
  finishWorkout,
  moveExercise,
  templateUpdateCandidate,
  updateTemplateFromSession,
} from '@/features/workout/actions';
import { ExerciseCard } from '@/features/workout/ExerciseCard';
import { useInProgressSession, useSessionDetail } from '@/features/workout/hooks';
import { leaveScreen } from '@/features/workout/navigation';
import { WorkoutTimer } from '@/features/workout/WorkoutTimer';
import { moveItem } from '@/domain/order';
import { countEmptySets, hasLoggedData, summarizeSession } from '@/domain/summary';
import i18n from '@/i18n/i18n';
import { Redirect, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard } from 'react-native';

/**
 * After a Finish, offers to copy the session's structure to the template it came from, when that
 * differs. Reads by the captured id: the screen has no in-progress session left by then. Not a
 * component (it fires after `router.replace`), so it reads `i18n.t` directly.
 */
function offerTemplateUpdate(sessionId: number) {
  const workout = templateUpdateCandidate(sessionId);
  if (!workout) return;
  const { t } = i18n;
  Alert.alert(
    t('workout.updateTemplateTitle', { name: workout.name }),
    t('workout.updateTemplateMessage'),
    [
      { text: t('workout.keepTemplate'), style: 'cancel' },
      {
        text: t('workout.updateTemplateAction'),
        onPress: () => {
          const result = updateTemplateFromSession(sessionId);
          if (!result.ok)
            Alert.alert(t('workout.updateTemplateFailedTitle'), t(`errors.${result.reason}`));
        },
      },
    ],
  );
}

export default function ActiveWorkoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useInProgressSession();
  const detail = useSessionDetail(session?.id);
  // A stale link redirects. A session that goes away while mounted (Finish, Discard) renders
  // nothing instead: a <Redirect> would race with the action's own navigation and could
  // replace the summary with `/`.
  const [mountedWithSession] = useState(session !== undefined);
  // Keeps the screen on while logging on the court; released automatically when this screen
  // unmounts (Finish, Discard, Minimize).
  useKeepAwake();

  if (!session || !detail) return mountedWithSession ? null : <Redirect href="/" />;

  const discard = () => {
    if (discardWorkout(session.id).ok) leaveScreen(router);
  };

  const confirmDiscard = () =>
    Alert.alert(t('workout.discardWorkoutTitle'), t('workout.discardWorkoutMessage'), [
      { text: t('workout.keepGoing'), style: 'cancel' },
      { text: t('workout.discard'), style: 'destructive', onPress: discard },
    ]);

  const finish = () => {
    // Blurs a focused cell, so an invalid entry is rolled back before the user answers.
    Keyboard.dismiss();
    if (!hasLoggedData(summarizeSession(detail.exercises))) {
      Alert.alert(t('workout.nothingLoggedTitle'), t('workout.nothingLoggedMessage'), [
        { text: t('workout.keepGoing'), style: 'cancel' },
        { text: t('workout.discardWorkoutButton'), style: 'destructive', onPress: discard },
      ]);
      return;
    }
    const empty = countEmptySets(detail.exercises);
    Alert.alert(
      t('workout.finishTitle'),
      empty > 0 ? t('workout.emptySetsWarning', { count: empty }) : t('workout.willBeSaved'),
      [
        { text: t('workout.keepGoing'), style: 'cancel' },
        {
          text: t('workout.finish'),
          onPress: () => {
            if (!finishWorkout(session.id).ok) return;
            haptics.confirm();
            // The summary goes first, so it shows behind the question.
            router.replace(`/workout-summary/${session.id}`);
            offerTemplateUpdate(session.id);
          },
        },
      ],
    );
  };

  const ids = detail.exercises.map((exercise) => exercise.id);

  return (
    <Screen
      title={session.name}
      titleVariant="title"
      left={
        <IconButton
          icon="keyboard_arrow_down"
          accessibilityLabel={t('workout.minimize')}
          onPress={() => leaveScreen(router)}
        />
      }
      right={<WorkoutTimer session={session} />}
      footer={<BottomActionBar label={t('workout.finishWorkout')} icon="check" onPress={finish} />}
      bottomInset
      keyboardAvoiding
    >
      {detail.exercises.length === 0 ? (
        <EmptyState
          icon="sports_basketball"
          title={t('workout.emptyTitle')}
          message={t('workout.emptyMessage')}
        />
      ) : (
        detail.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            count={ids.length}
            onMove={(delta) => moveExercise(session.id, moveItem(ids, index, delta))}
          />
        ))
      )}
      <Button
        variant="secondary"
        icon="add"
        label={t('workout.addExercise')}
        fullWidth
        onPress={() => router.push('/add-exercise')}
      />
      <Button
        variant="danger"
        label={t('workout.discardWorkoutAction')}
        fullWidth
        onPress={confirmDiscard}
      />
    </Screen>
  );
}
