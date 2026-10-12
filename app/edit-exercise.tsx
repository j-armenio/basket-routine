import { AppText } from '@/components/AppText';
import { BottomActionBar } from '@/components/BottomActionBar';
import { Button } from '@/components/Button';
import { ChipRow } from '@/components/ChipRow';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import type { Exercise } from '@/db/types';
import { pickedMedia, type PickedMedia } from '@/domain/media';
import { CATEGORIES, TRACKING_TYPES, type Category, type TrackingType } from '@/domain/types';
import { createExercise, updateExercise, type MediaChange } from '@/features/exercises/actions';
import { useExercise } from '@/features/exercises/hooks';
import { exerciseMedia } from '@/features/exercises/mediaSource';
import { MediaView } from '@/features/exercises/MediaView';
import { leaveScreen } from '@/features/workout/navigation';
import { radius, size, spacing } from '@/theme/spacing';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

const parseId = (value: string | undefined) => (value === undefined ? undefined : Number(value));

/** The exercise form: no param creates, `?exerciseId=` edits a custom exercise. */
export default function EditExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ exerciseId?: string }>();
  const editingId = parseId(params.exerciseId);
  const exercise = useExercise(editingId);

  const { t } = useTranslation();
  // A predefined exercise is read-only.
  if (editingId !== undefined && !exercise?.isCustom) {
    return (
      <Screen
        title={t('exercises.editExerciseTitle')}
        titleVariant="title"
        left={
          <IconButton
            icon="close"
            accessibilityLabel={t('common.cancel')}
            onPress={() => leaveScreen(router)}
          />
        }
        bottomInset
      >
        <EmptyState
          icon="sports_basketball"
          title={t('exercises.notFoundTitle')}
          message={t('exercises.notFoundMessage')}
          action={{ label: t('common.back'), onPress: () => leaveScreen(router) }}
        />
      </Screen>
    );
  }
  // The form keeps the values it opened with: later changes to the exercise don't reset it.
  return <ExerciseForm exercise={exercise} />;
}

function ExerciseForm({ exercise }: { exercise: Exercise | undefined }) {
  const { t } = useTranslation();
  const router = useRouter();
  const editing = exercise !== undefined;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: t(`labels.category.${value}`),
  }));
  const trackingOptions = TRACKING_TYPES.map((value) => ({
    value,
    label: t(`labels.tracking.${value}`),
  }));
  const [name, setName] = useState(exercise?.name ?? '');
  const [category, setCategory] = useState<Category>(exercise?.category ?? 'shooting');
  const [trackingType, setTrackingType] = useState<TrackingType>(
    exercise?.trackingType ?? 'makes_attempts',
  );
  const [description, setDescription] = useState(exercise?.description ?? '');
  const [media, setMedia] = useState<MediaChange>({ type: 'keep' });
  const [error, setError] = useState<string | null>(null);

  const shownMedia =
    media.type === 'replace'
      ? { kind: media.media.kind, source: media.media.uri }
      : media.type === 'remove' || !exercise
        ? undefined
        : exerciseMedia(exercise);

  const change =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setError(null);
    };

  const chooseMedia = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 1,
    });
    const asset = result.canceled ? undefined : result.assets?.[0];
    if (!asset) return;
    const picked = pickedMedia(asset);
    if (picked.ok) {
      setMedia({ type: 'replace', media: picked.media });
      setError(null);
    } else {
      setError(
        t(
          picked.reason === 'too_long'
            ? 'exercises.videoTooLong'
            : 'exercises.unsupportedMediaType',
        ),
      );
    }
  };

  const save = () => {
    const replacement: PickedMedia | undefined = media.type === 'replace' ? media.media : undefined;
    const result = exercise
      ? updateExercise(exercise.id, { name, category, description }, media)
      : createExercise({ name, category, trackingType, description }, replacement);
    if (result.ok) leaveScreen(router);
    else setError(t(`errors.${result.reason}`));
  };

  return (
    <Screen
      title={t(editing ? 'exercises.editExerciseTitle' : 'exercises.newExerciseTitle')}
      titleVariant="title"
      left={
        <IconButton
          icon="close"
          accessibilityLabel={t('common.cancel')}
          onPress={() => leaveScreen(router)}
        />
      }
      footer={<BottomActionBar label={t('exercises.saveExercise')} onPress={save} />}
      bottomInset
      keyboardAvoiding
    >
      <Field label={t('common.name')}>
        <TextField
          accessibilityLabel={t('exercises.namePlaceholder')}
          placeholder={t('exercises.namePlaceholder')}
          value={name}
          onChangeText={change(setName)}
          autoFocus={!editing}
          returnKeyType="done"
        />
      </Field>
      <Field label={t('exercises.media')}>
        <View testID="exercise-media">
          <MediaView
            media={shownMedia}
            playing
            fit="contain"
            iconSize={size.placeholderIcon}
            style={styles.media}
          />
        </View>
        <View style={styles.mediaButtons}>
          <Button
            variant="outline"
            icon="photo_library"
            label={t(shownMedia ? 'exercises.changeMedia' : 'exercises.chooseMedia')}
            onPress={chooseMedia}
          />
          {shownMedia && (
            <Button
              variant="danger"
              label={t('exercises.removeMedia')}
              onPress={() => {
                setMedia({ type: 'remove' });
                setError(null);
              }}
            />
          )}
        </View>
      </Field>
      <Field label={t('exercises.category')}>
        <ChipRow options={categoryOptions} value={category} onChange={change(setCategory)} wrap />
      </Field>
      <Field label={t('exercises.trackingType')}>
        <ChipRow
          options={trackingOptions}
          value={trackingType}
          onChange={change(setTrackingType)}
          disabled={editing}
          wrap
        />
        {editing && (
          <AppText variant="caption" tone="secondary">
            {t('exercises.trackingTypeLocked')}
          </AppText>
        )}
      </Field>
      <Field label={t('exercises.description')}>
        <TextField
          accessibilityLabel={t('exercises.description')}
          placeholder={t('exercises.descriptionPlaceholder')}
          value={description}
          onChangeText={change(setDescription)}
          multiline
          maxLines={8}
        />
      </Field>
      {error && (
        <AppText tone="error" accessibilityRole="alert">
          {error}
        </AppText>
      )}
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="subtitle" weight="bold" tone="secondary">
        {label}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  media: {
    width: '100%',
    height: size.mediaForm,
    borderRadius: radius.button,
  },
  mediaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
