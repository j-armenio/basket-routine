import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { fgTone } from '@/components/fgTone';
import { StatTile } from '@/components/StatTile';
import type { ExerciseSessionResult } from '@/domain/exerciseStats';
import { fgBand } from '@/domain/fg';
import { formatDayDate, formatFgPct } from '@/domain/format';
import type { TrackingType } from '@/domain/types';
import { useLanguage } from '@/features/settings/hooks';
import { makeStyles } from '@/theme/makeStyles';
import { border, size, spacing } from '@/theme/spacing';
import { tabularNums } from '@/theme/typography';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useExerciseStats } from './hooks';

/**
 * "Your stats" on the exercise detail, from the real history. A shooting drill: its best session,
 * its overall FG% (Σmakes / Σattempts) and how many sessions; a check drill: the sessions and the
 * done sets. Then the latest sessions.
 */
export function ExerciseStatsCard({
  exerciseId,
  trackingType,
}: {
  exerciseId: number;
  trackingType: TrackingType;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const stats = useExerciseStats(exerciseId);
  const shooting = trackingType === 'makes_attempts';

  return (
    <Card style={styles.card}>
      <AppText variant="sectionTitle" accessibilityRole="header">
        {t('exercises.yourStats')}
      </AppText>
      {stats.sessions === 0 ? (
        <AppText variant="bodySmall" tone="secondary">
          {t('exercises.noSessionsYet')}
        </AppText>
      ) : (
        <>
          <View style={styles.tiles}>
            {shooting ? (
              <>
                <StatTile
                  label={t('exercises.bestFgPct')}
                  value={formatFgPct(stats.best)}
                  tone={fgTone(fgBand(stats.best))}
                />
                <StatTile
                  label={t('exercises.average')}
                  value={formatFgPct(stats.shooting.fgPct)}
                  tone={fgTone(fgBand(stats.shooting.fgPct))}
                />
              </>
            ) : (
              <StatTile
                label={t('exercises.done')}
                value={`${stats.check.completed} / ${stats.check.total}`}
              />
            )}
            <StatTile label={t('exercises.sessions')} value={String(stats.sessions)} />
          </View>
          <View>
            <AppText variant="sectionHeader" tone="secondary" style={styles.recentTitle}>
              {t('exercises.recentSessions')}
            </AppText>
            {stats.recent.map((result, index) => (
              <RecentRow
                key={result.sessionId}
                result={result}
                shooting={shooting}
                last={index === stats.recent.length - 1}
              />
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

function RecentRow({
  result,
  shooting,
  last,
}: {
  result: ExerciseSessionResult;
  shooting: boolean;
  last: boolean;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const logged = result.shooting.attempts > 0;
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <AppText variant="bodySmall" style={styles.date}>
        {formatDayDate(result.startedAt, locale)}
      </AppText>
      {shooting ? (
        <>
          <AppText variant="bodySmall" tone="secondary" style={tabularNums}>
            {logged ? `${result.shooting.makes} / ${result.shooting.attempts}` : '—'}
          </AppText>
          <AppText
            variant="bodySmall"
            weight="bold"
            tone={fgTone(fgBand(result.shooting.fgPct))}
            style={[styles.fg, tabularNums]}
          >
            {formatFgPct(result.shooting.fgPct)}
          </AppText>
        </>
      ) : (
        <AppText variant="bodySmall" tone="secondary" style={tabularNums}>
          {t('history.checksLabel', {
            completed: result.check.completed,
            total: result.check.total,
          })}
        </AppText>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    gap: spacing.lg,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  recentTitle: {
    marginBottom: spacing.xs,
  },
  row: {
    minHeight: size.minTouchTarget - spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  divider: {
    borderBottomWidth: border.hairline,
    borderBottomColor: colors.outline,
  },
  date: {
    flex: 1,
  },
  fg: {
    width: size.setFgColumn,
    textAlign: 'right',
  },
}));
