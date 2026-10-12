import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import type { Exercise } from '@/db/types';
import { makeStyles } from '@/theme/makeStyles';
import { spacing } from '@/theme/spacing';
import type { AndroidSymbol } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { SectionList, View } from 'react-native';
import type { CategorySection } from './catalogList';
import { ExerciseRow } from './ExerciseRow';

type ExerciseListProps = {
  sections: CategorySection<Exercise>[];
  onPressExercise: (exercise: Exercise) => void;
  rightIcon?: AndroidSymbol;
  /** What the empty list says (default: "No exercises found"). */
  empty?: { title: string; message?: string };
  /** Room at the bottom, so the last row can scroll out from under a FAB. */
  bottomClearance?: number;
  /** A category's header over its rows (default). Off for a list of one category under its title. */
  sectionHeaders?: boolean;
};

/**
 * The catalog grouped by category, edge to edge (the screen's own side padding is taken back).
 * Taps go through while the keyboard is open, for a search field above it.
 */
export function ExerciseList({
  sections,
  onPressExercise,
  rightIcon,
  empty,
  bottomClearance = 0,
  sectionHeaders = true,
}: ExerciseListProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const emptyState = empty ?? { title: t('exercises.noExercisesFound') };
  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={{ paddingBottom: spacing.lg + bottomClearance }}
      sections={sections}
      keyExtractor={(exercise) => String(exercise.id)}
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
      ItemSeparatorComponent={Separator}
      renderSectionHeader={
        sectionHeaders ? ({ section }) => <SectionHeader section={section} /> : undefined
      }
      renderItem={({ item }) => (
        <ExerciseRow exercise={item} rightIcon={rightIcon} onPress={() => onPressExercise(item)} />
      )}
      ListEmptyComponent={
        <EmptyState icon="search" title={emptyState.title} message={emptyState.message} />
      }
    />
  );
}

function Separator() {
  const styles = useStyles();
  return <View style={styles.separator} />;
}

function SectionHeader({ section }: { section: { title: string } }) {
  const styles = useStyles();
  return (
    <AppText
      variant="sectionHeader"
      tone="secondary"
      accessibilityRole="header"
      style={styles.sectionHeader}
    >
      {section.title}
    </AppText>
  );
}

const useStyles = makeStyles((colors) => ({
  list: {
    flex: 1,
    marginHorizontal: -spacing.screenPadding,
  },
  sectionHeader: {
    paddingHorizontal: spacing.screenPadding + spacing.xs,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xsPlus,
    backgroundColor: colors.background,
  },
  separator: {
    height: spacing.xsPlus,
  },
}));
