import { ActionSheet } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { fgTone } from '@/components/fgTone';
import { Icon } from '@/components/Icon';
import { fgBand } from '@/domain/fg';
import { formatFgPct } from '@/domain/format';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { opacity, size, spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { FgChart } from './FgChart';
import {
  CHART_RANGES,
  chartRangeLabel,
  chartRangeShortLabel,
  type ChartRange,
  type FgPoint,
} from './historyList';

type FgEvolutionCardProps = {
  points: FgPoint[];
  /** How many sessions the chart shows, picked from the card's menu. */
  range: ChartRange;
  onChangeRange: (range: ChartRange) => void;
};

/** The top of History: the latest session's FG% and the chart of the last few (or all). */
export function FgEvolutionCard({ points, range, onChangeRange }: FgEvolutionCardProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const latest = points.at(-1);
  if (!latest) return null;
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="sectionTitle" accessibilityRole="header">
          {t('history.evolutionTitle')}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('history.chartRangeAccessibility', {
            range: chartRangeLabel(t, range).toLowerCase(),
          })}
          onPress={() => setMenuOpen(true)}
          style={({ pressed }) => [styles.rangeButton, pressed && styles.pressed]}
        >
          <AppText variant="caption" weight="bold" tone="secondary">
            {chartRangeShortLabel(t, range)}
          </AppText>
          <Icon name="keyboard_arrow_down" size={size.iconSmall} color={colors.iconMuted} />
        </Pressable>
      </View>
      <View style={styles.latest}>
        <AppText variant="statMedium" tone={fgTone(fgBand(latest.fgPct))}>
          {formatFgPct(latest.fgPct)}
        </AppText>
        <AppText variant="subtitle" tone="secondary">
          {t('history.latestWorkout')}
        </AppText>
      </View>
      <FgChart points={points} all={range === 'all'} />
      <ActionSheet
        visible={menuOpen}
        title={t('history.showInChart')}
        options={CHART_RANGES.map((option) => ({
          label: chartRangeLabel(t, option),
          selected: option === range,
          onPress: () => onChangeRange(option),
        }))}
        onClose={() => setMenuOpen(false)}
      />
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    paddingBottom: spacing.mdPlus,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  // 48 dp tall to be pressable, pulled into the header's line so the card doesn't grow.
  rangeButton: {
    minHeight: size.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: -spacing.md,
    marginRight: -spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  latest: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
}));
