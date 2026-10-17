import { ActionSheet } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { IconButton } from '@/components/IconButton';
import type { RoutineWithWorkouts } from '@/db/repositories/routines';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { size, spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { deleteRoutine } from './actions';

type RoutineCarouselProps = {
  routines: RoutineWithWorkouts[];
  /** The routine shown, an index into `routines`. */
  index: number;
  onSelect: (index: number) => void;
  onRename: () => void;
  onMove: (delta: -1 | 1) => void;
};

/**
 * The Workout tab's routine picker, kept quiet since routines rarely change: ‹ and › step to the
 * previous and next routine (a swipe changes the tab), the shown one's name with its menu (rename,
 * move left or right, delete), and a dot per routine marking where it is.
 */
export function RoutineCarousel({
  routines,
  index,
  onSelect,
  onRename,
  onMove,
}: RoutineCarouselProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const routine = routines[index];
  const count = routines.length;
  const workouts = routine.workouts.length;

  const confirmDelete = () =>
    Alert.alert(
      t('routines.deleteTitle', { name: routine.name }),
      workouts === 0
        ? t('routines.historyStays')
        : t('routines.deleteRoutineMessage', { count: workouts }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteRoutine(routine.id),
        },
      ],
    );

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <IconButton
          icon="chevron_left"
          color={colors.iconMuted}
          accessibilityLabel={t('routines.previousRoutine')}
          disabled={index === 0}
          onPress={() => onSelect(index - 1)}
        />
        <View style={styles.current}>
          <AppText
            variant="sectionHeader"
            tone="secondary"
            accessibilityRole="header"
            numberOfLines={1}
            style={styles.name}
          >
            {routine.name}
          </AppText>
          <IconButton
            icon="more_vert"
            color={colors.iconMuted}
            accessibilityLabel={t('common.itemMenu', { name: routine.name })}
            onPress={() => setMenuOpen(true)}
          />
        </View>
        <IconButton
          icon="chevron_right"
          color={colors.iconMuted}
          accessibilityLabel={t('routines.nextRoutine')}
          disabled={index === count - 1}
          onPress={() => onSelect(index + 1)}
        />
      </View>
      {count > 1 && (
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel={t('routines.position', { index: index + 1, count })}
          style={styles.dots}
        >
          {routines.map((item, position) => (
            <View key={item.id} style={[styles.dot, position === index && styles.dotCurrent]} />
          ))}
        </View>
      )}
      <ActionSheet
        visible={menuOpen}
        title={routine.name}
        options={[
          { label: t('routines.rename'), icon: 'edit', onPress: onRename },
          {
            label: t('common.moveLeft'),
            icon: 'arrow_back',
            disabled: index === 0,
            onPress: () => onMove(-1),
          },
          {
            label: t('common.moveRight'),
            icon: 'arrow_forward',
            disabled: index === count - 1,
            onPress: () => onMove(1),
          },
          { label: t('common.delete'), icon: 'delete', destructive: true, onPress: confirmDelete },
        ]}
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: {
    gap: spacing.xxs,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // The name and its ⋮, centered between the arrows.
  current: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flexShrink: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xsPlus,
  },
  dot: {
    width: size.carouselDot,
    height: size.carouselDot,
    borderRadius: size.carouselDot / 2,
    backgroundColor: colors.outline,
  },
  dotCurrent: {
    backgroundColor: colors.secondaryOutline,
  },
}));
