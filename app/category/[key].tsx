import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { categoryKeyLabel, exerciseCount, isCategoryKey } from '@/features/exercises/catalogList';
import { ExerciseList } from '@/features/exercises/ExerciseList';
import { useExercises } from '@/features/exercises/hooks';
import { leaveScreen } from '@/features/workout/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

/**
 * The exercises of one category card: a category's (under its title, no section header), or
 * the user's own ones (`custom`), grouped by category.
 */
export default function CategoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { key } = useLocalSearchParams<{ key: string }>();
  const valid = isCategoryKey(key);
  const sections = useExercises(
    !valid ? {} : key === 'custom' ? { customOnly: true } : { category: key },
  );
  const back = (
    <IconButton
      icon="arrow_back"
      accessibilityLabel={t('common.back')}
      onPress={() => leaveScreen(router)}
    />
  );

  if (!valid) {
    return (
      <Screen
        title={t('exercises.categoryScreenTitle')}
        titleVariant="titleLarge"
        left={back}
        bottomInset
      >
        <EmptyState
          icon="search"
          title={t('exercises.notFoundCategoryTitle')}
          message={t('exercises.notFoundCategoryMessage')}
          action={{
            label: t('common.backToExercises'),
            onPress: () => router.dismissTo('/exercises'),
          }}
        />
      </Screen>
    );
  }

  const count = sections.reduce((total, section) => total + section.data.length, 0);
  return (
    <Screen
      title={categoryKeyLabel(t, key)}
      titleVariant="titleLarge"
      subtitle={exerciseCount(t, count)}
      left={back}
      scroll={false}
      bottomInset
    >
      <ExerciseList
        sections={sections}
        sectionHeaders={key === 'custom'}
        empty={
          key === 'custom'
            ? {
                title: t('exercises.noCustomTitle'),
                message: t('exercises.noCustomMessage'),
              }
            : { title: t('exercises.noExercisesYet') }
        }
        onPressExercise={(exercise) => router.push(`/exercise/${exercise.id}`)}
      />
    </Screen>
  );
}
