import { ActionSheet, type ActionSheetOption } from '@/components/ActionSheet';
import { AppText } from '@/components/AppText';
import { BottomActionBar } from '@/components/BottomActionBar';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { deleteExercise, exerciseUsage } from '@/features/exercises/actions';
import { ExerciseStatsCard } from '@/features/exercises/ExerciseStatsCard';
import { exerciseMedia } from '@/features/exercises/mediaSource';
import { MediaView } from '@/features/exercises/MediaView';
import { useExercise } from '@/features/exercises/hooks';
import { leaveScreen } from '@/features/workout/navigation';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { radius, size } from '@/theme/spacing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

/**
 * An exercise: its media, large and playing, its description and the user's stats with it, and
 * Add to Routine. Custom ones can be edited and deleted.
 */
export default function ExerciseDetailScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = useExercise(Number(id));
  const [menuOpen, setMenuOpen] = useState(false);
  // A stale link shows "not found". An exercise that goes away while mounted (deleted from here)
  // renders nothing, so "not found" doesn't flash on the way out.
  const [mountedWithExercise] = useState(exercise !== undefined);
  const back = (
    <IconButton
      icon="arrow_back"
      accessibilityLabel={t('common.back')}
      onPress={() => leaveScreen(router)}
    />
  );

  if (!exercise) {
    if (mountedWithExercise) return null;
    return (
      <Screen title={t('exercises.detailTitle')} titleVariant="titleLarge" left={back} bottomInset>
        <EmptyState
          icon="sports_basketball"
          title={t('exercises.notFoundTitle')}
          message={t('exercises.notFoundMessage')}
          action={{
            label: t('common.backToExercises'),
            onPress: () => router.dismissTo('/exercises'),
          }}
        />
      </Screen>
    );
  }

  const remove = () => {
    const result = deleteExercise(exercise.id);
    if (result.ok) leaveScreen(router);
    else Alert.alert(t('exercises.deleteFailedTitle'), t(`errors.${result.reason}`));
  };

  const confirmDelete = () => {
    const workouts = exerciseUsage(exercise.id);
    const removal = workouts > 0 ? t('exercises.removedFromWorkouts', { count: workouts }) : '';
    Alert.alert(
      t('exercises.deleteExerciseTitle', { name: exercise.name }),
      `${removal}${t('routines.historyStays')}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: remove },
      ],
    );
  };

  const options: ActionSheetOption[] = [
    {
      label: t('common.edit'),
      icon: 'edit',
      onPress: () => router.push(`/edit-exercise?exerciseId=${exercise.id}`),
    },
    { label: t('common.delete'), icon: 'delete', destructive: true, onPress: confirmDelete },
  ];

  return (
    <Screen
      title={exercise.name}
      titleVariant="titleLarge"
      subtitle={`${t(`labels.category.${exercise.category}`)} · ${t(`labels.tracking.${exercise.trackingType}`)}`}
      left={back}
      right={
        // A predefined exercise is read-only: no menu, which is also how it shows.
        exercise.isCustom && (
          <IconButton
            icon="more_vert"
            color={colors.iconMuted}
            accessibilityLabel={t('exercises.exerciseMenu')}
            onPress={() => setMenuOpen(true)}
          />
        )
      }
      footer={
        <BottomActionBar
          label={t('exercises.addToRoutine')}
          icon="playlist_add"
          onPress={() => router.push(`/add-to-routine?exerciseId=${exercise.id}`)}
        />
      }
      bottomInset
    >
      <View testID="exercise-media">
        <MediaView
          media={exerciseMedia(exercise)}
          playing
          controls
          fit="contain"
          iconSize={size.placeholderIcon}
          style={styles.media}
        />
      </View>
      {exercise.description === '' ? (
        <AppText tone="secondary">{t('exercises.noDescription')}</AppText>
      ) : (
        <AppText>{exercise.description}</AppText>
      )}
      <ExerciseStatsCard exerciseId={exercise.id} trackingType={exercise.trackingType} />
      <ActionSheet
        visible={menuOpen}
        title={exercise.name}
        options={options}
        onClose={() => setMenuOpen(false)}
      />
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  media: {
    width: '100%',
    height: size.mediaHero,
    borderRadius: radius.card,
  },
}));
