import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { formatWorkoutDate } from '@/domain/format';
import { sessionDurationMs } from '@/domain/sessionTime';
import { summarizeSession } from '@/domain/summary';
import { deleteSession } from '@/features/history/actions';
import { useFinishedSession } from '@/features/history/hooks';
import { SessionExerciseView } from '@/features/history/SessionExerciseView';
import { SessionTotals } from '@/features/history/SessionTotals';
import { useLanguage } from '@/features/settings/hooks';
import { leaveScreen } from '@/features/workout/navigation';
import { formatDuration } from '@/i18n/format';
import { useColors } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

/** A finished session, read-only: the totals and every exercise as they were stored at Finish. */
export default function SessionDetailScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useFinishedSession(Number(id));
  // A stale link shows "not found". A session that goes away while mounted (deleted from here)
  // renders nothing, so "not found" doesn't flash on the way out.
  const [mountedWithSession] = useState(session !== undefined);
  const back = (
    <IconButton
      icon="arrow_back"
      accessibilityLabel={t('common.back')}
      onPress={() => leaveScreen(router)}
    />
  );

  if (!session) {
    if (mountedWithSession) return null;
    return (
      <Screen title={t('history.workout')} titleVariant="titleLarge" left={back} bottomInset>
        <EmptyState
          icon="history"
          title={t('history.workoutNotFoundTitle')}
          message={t('history.workoutNotFoundMessage')}
          action={{ label: t('common.backToProfile'), onPress: () => router.dismissTo('/profile') }}
        />
      </Screen>
    );
  }

  const date = formatWorkoutDate(session.startedAt, locale);
  const duration = sessionDurationMs(session);

  const remove = () => {
    const result = deleteSession(session.id);
    if (result.ok) leaveScreen(router);
    else Alert.alert(t('history.deleteFailedTitle'), t(`errors.${result.reason}`));
  };

  const confirmDelete = () =>
    Alert.alert(
      t('history.deleteSessionTitle'),
      t('history.deleteSessionMessage', { name: session.name, date }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: remove },
      ],
    );

  return (
    <Screen
      title={session.name}
      titleVariant="titleLarge"
      subtitle={`${date} · ${formatDuration(t, duration)}`}
      left={back}
      right={
        <IconButton
          icon="delete"
          color={colors.iconMuted}
          accessibilityLabel={t('history.deleteWorkout')}
          onPress={confirmDelete}
        />
      }
      bottomInset
    >
      <SessionTotals summary={summarizeSession(session.exercises)} />
      {session.exercises.map((exercise) => (
        <SessionExerciseView key={exercise.id} exercise={exercise} />
      ))}
    </Screen>
  );
}
