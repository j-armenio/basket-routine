import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { fgTone } from '@/components/fgTone';
import { fgBand } from '@/domain/fg';
import { formatFgPct } from '@/domain/format';
import type { SessionSummary } from '@/domain/summary';
import { spacing } from '@/theme/spacing';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

/** The totals of a finished session: shooting FG% and completed checks, each only when present. */
export function SessionTotals({ summary }: { summary: SessionSummary }) {
  const { t } = useTranslation();
  return (
    <>
      {summary.shooting.attempts > 0 && (
        <Card style={styles.card}>
          <AppText variant="sectionTitle">{t('history.shooting')}</AppText>
          <AppText variant="stat" tone={fgTone(fgBand(summary.shooting.fgPct))}>
            {formatFgPct(summary.shooting.fgPct)}
          </AppText>
          <AppText variant="bodySmall" tone="secondary">
            {t('history.shootingTotals', {
              makes: summary.shooting.makes,
              attempts: summary.shooting.attempts,
            })}
          </AppText>
        </Card>
      )}
      {summary.check.total > 0 && (
        <Card style={styles.card}>
          <AppText variant="sectionTitle">{t('history.checks')}</AppText>
          <AppText variant="stat">
            {summary.check.completed} / {summary.check.total}
          </AppText>
          <AppText variant="bodySmall" tone="secondary">
            {t('history.completed')}
          </AppText>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xsPlus,
  },
});
