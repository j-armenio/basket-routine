import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { FgEvolutionCard } from '@/features/history/FgEvolutionCard';
import {
  chartRangeCount,
  fgEvolution,
  groupByMonth,
  PROFILE_HISTORY_COUNT,
  profileStats,
  type ChartRange,
} from '@/features/history/historyList';
import { useHistory } from '@/features/history/hooks';
import { HistoryRow } from '@/features/history/HistoryRow';
import { MonthHeader } from '@/features/history/MonthHeader';
import { useProfile } from '@/features/profile/hooks';
import { ProfileCard } from '@/features/profile/ProfileCard';
import { ProfileStatsCard } from '@/features/profile/ProfileStatsCard';
import { useLanguage } from '@/features/settings/hooks';
import { size, spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

/**
 * The profile (with Settings at the top right), then the stats over the history (sessions, AVG
 * FG%, shots, time), the FG% evolution chart, and the latest sessions by month, with "See all"
 * opening the full History.
 */
export default function ProfileScreen() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const router = useRouter();
  const profile = useProfile();
  const items = useHistory();
  const recent = useMemo(
    () => groupByMonth(items.slice(0, PROFILE_HISTORY_COUNT), locale),
    [items, locale],
  );
  const stats = useMemo(() => profileStats(items), [items]);
  // How many sessions the FG% evolution chart shows. Kept here, so it lasts while the app is
  // open (the tab stays mounted) and starts back at 5 on the next launch.
  const [range, setRange] = useState<ChartRange>(5);
  const editProfile = () => router.push('/edit-profile');

  return (
    <Screen
      title={t('profile.title')}
      right={
        <IconButton
          icon="settings"
          accessibilityLabel={t('settings.title')}
          onPress={() => router.push('/settings')}
        />
      }
    >
      <ProfileCard profile={profile} onEdit={editProfile} />
      {items.length === 0 ? (
        <EmptyState
          icon="history"
          title={t('history.emptyTitle')}
          message={t('history.emptyMessageWithStats')}
        />
      ) : (
        <>
          <ProfileStatsCard stats={stats} />
          <FgEvolutionCard
            points={fgEvolution(items, chartRangeCount(range))}
            range={range}
            onChangeRange={setRange}
          />
          <View style={styles.historyHeader}>
            <AppText variant="headline" accessibilityRole="header">
              {t('history.title')}
            </AppText>
            {items.length > PROFILE_HISTORY_COUNT && (
              <Button
                variant="ghost"
                label={t('history.seeAll')}
                onPress={() => router.push('/history')}
              />
            )}
          </View>
          {recent.map((section) => (
            <View key={section.title} style={styles.section}>
              <MonthHeader title={section.title} />
              {section.data.map((item) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/session/${item.id}`)}
                />
              ))}
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  historyHeader: {
    minHeight: size.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingLeft: spacing.xs,
  },
  section: {
    gap: spacing.itemGap,
  },
});
