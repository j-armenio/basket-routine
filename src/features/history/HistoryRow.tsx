import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { fgTone } from '@/components/fgTone';
import { formatWorkoutDate } from '@/domain/format';
import { formatDuration, formatExerciseList } from '@/i18n/format';
import { useLanguage } from '@/features/settings/hooks';
import { spacing } from '@/theme/spacing';
import { tabularNums } from '@/theme/typography';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { sessionResult, type HistoryItem } from './historyList';

type HistoryRowProps = {
  item: HistoryItem;
  onPress: () => void;
};

/** A finished session in the History list: what it was, when, and its result on the right. */
export function HistoryRow({ item, onPress }: HistoryRowProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const date = formatWorkoutDate(item.startedAt, locale);
  const { fgPct, fgBand, checks } = sessionResult(t, item.summary);

  return (
    // The name alone isn't enough: names repeat ("Morning Workout").
    <Card onPress={onPress} accessibilityLabel={`${item.name}, ${date}`} style={styles.card}>
      <View style={styles.texts}>
        <AppText variant="cardTitle" numberOfLines={1}>
          {item.name}
        </AppText>
        <AppText variant="subtitle" tone="secondary">
          {`${date} · ${formatDuration(t, item.durationMs)}`}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={2}>
          {formatExerciseList(t, item.exerciseNames)}
        </AppText>
      </View>
      <View style={styles.result}>
        {fgPct === null && checks === null && <AppText variant="headline">—</AppText>}
        {fgPct !== null && (
          <AppText variant="headline" tone={fgTone(fgBand)} style={tabularNums}>
            {fgPct}
          </AppText>
        )}
        {checks !== null && (
          <AppText variant="caption" tone="secondary">
            {checks}
          </AppText>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  result: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
});
