import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { fgTone } from '@/components/fgTone';
import { Screen } from '@/components/Screen';
import { fgBand } from '@/domain/fg';
import { formatFgPct, formatWorkoutDate } from '@/domain/format';
import { summarizeExercise, summarizeSession } from '@/domain/summary';
import { SessionTotals } from '@/features/history/SessionTotals';
import { useLanguage } from '@/features/settings/hooks';
import { useSessionDetail } from '@/features/workout/hooks';
import { formatDuration } from '@/i18n/format';
import { spacing } from '@/theme/spacing';
import { tabularNums } from '@/theme/typography';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export default function WorkoutSummaryScreen() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useSessionDetail(Number(id));
  const done = () => router.dismissTo('/');

  if (!detail || detail.status !== 'finished') {
    return (
      <Screen title={t('workoutSummary.title')} bottomInset>
        <EmptyState
          icon="history"
          title={t('workoutSummary.notFoundTitle')}
          message={t('workoutSummary.notFoundMessage')}
          action={{ label: t('common.backToWorkout'), onPress: done }}
        />
      </Screen>
    );
  }

  const summary = summarizeSession(detail.exercises);
  const duration = detail.finishedAt ? detail.finishedAt.getTime() - detail.startedAt.getTime() : 0;

  return (
    <Screen
      title={detail.name}
      subtitle={`${formatWorkoutDate(detail.startedAt, locale)} · ${formatDuration(t, duration)}`}
      bottomInset
    >
      <SessionTotals summary={summary} />
      <Card style={styles.exercises}>
        <AppText variant="sectionTitle">{t('workoutSummary.exercises')}</AppText>
        {detail.exercises.length === 0 && (
          <AppText variant="bodySmall" tone="secondary">
            {t('workoutSummary.noExercises')}
          </AppText>
        )}
        {detail.exercises.map((exercise) => {
          const result = summarizeExercise(exercise);
          return (
            <View key={exercise.id} style={styles.line}>
              <AppText variant="bodySmall" style={styles.name} numberOfLines={1}>
                {exercise.name}
              </AppText>
              <AppText variant="bodySmall" tone="secondary" style={tabularNums}>
                {result.trackingType === 'check' ? (
                  t('workoutSummary.doneLabel', {
                    completed: result.completed,
                    total: result.total,
                  })
                ) : result.attempts > 0 ? (
                  <>
                    {`${result.makes} / ${result.attempts} · `}
                    <AppText variant="bodySmall" weight="bold" tone={fgTone(fgBand(result.fgPct))}>
                      {formatFgPct(result.fgPct)}
                    </AppText>
                  </>
                ) : (
                  '—'
                )}
              </AppText>
            </View>
          );
        })}
      </Card>
      <View style={styles.done}>
        <Button label={t('workoutSummary.done')} fullWidth onPress={done} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  exercises: {
    gap: spacing.mdPlus,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
  },
  done: {
    marginTop: spacing.sm,
  },
});
