import { IconButton } from '@/components/IconButton';
import { makeStyles } from '@/theme/makeStyles';
import { opacity, radius, size, spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useExercise } from './hooks';
import { exerciseMedia, type MediaSource } from './mediaSource';
import { MediaPlaceholder, MediaView } from './MediaView';

type ExerciseThumbnailProps = {
  exerciseId: number;
  /** The card's name for it (a session keeps its own snapshot of the name). */
  name: string;
};

/** How the floating media was opened: held (it closes on release) or tapped (it stays). */
type Floating = 'held' | 'pinned';

/**
 * An exercise's media as a still thumbnail in a workout card's header (the active workout and the
 * template editor). Holding it floats the media, playing, in the middle of the screen until the
 * finger lifts; a tap floats it until a tap outside, Back or its ✕. No media (or a deleted
 * exercise): the placeholder, inert.
 */
export function ExerciseThumbnail({ exerciseId, name }: ExerciseThumbnailProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const exercise = useExercise(exerciseId);
  const [floating, setFloating] = useState<Floating | null>(null);
  const media = exercise && exerciseMedia(exercise);

  if (!media) return <MediaPlaceholder style={styles.thumb} iconSize={size.iconLarge} />;
  const close = () => setFloating(null);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('exercises.playMediaFor', { name })}
        accessibilityHint={t('exercises.holdToPlay')}
        onPress={() => setFloating('pinned')}
        delayLongPress={250}
        onLongPress={() => setFloating('held')}
        // Only a hold closes on release: a tap's own release comes before its `onPress`.
        onPressOut={() => setFloating((current) => (current === 'held' ? null : current))}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <MediaView media={media} playing={false} style={styles.thumb} iconSize={size.iconLarge} />
      </Pressable>
      <FloatingMedia media={media} mode={floating} onClose={close} />
    </>
  );
}

/** Portrait, like the bundled clips; `contain` fits any other shape inside it. */
const FLOATING_ASPECT = 3 / 4;
/** The most of the screen's height the floating box takes. */
const FLOATING_MAX_HEIGHT = 0.75;

function FloatingMedia({
  media,
  mode,
  onClose,
}: {
  media: MediaSource;
  mode: Floating | null;
  onClose: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const window = useWindowDimensions();
  const width = Math.min(
    window.width - 2 * spacing.screenPadding,
    window.height * FLOATING_MAX_HEIGHT * FLOATING_ASPECT,
  );
  const box = { width, height: width / FLOATING_ASPECT };
  const pinned = mode === 'pinned';
  return (
    <Modal
      visible={mode !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* While held, the finger stays on the thumbnail: only a pinned one closes from here. */}
        {pinned ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.closeDialog')}
            style={[StyleSheet.absoluteFill, styles.backdrop]}
            onPress={onClose}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
        )}
        <View testID="floating-media">
          <MediaView
            media={media}
            playing
            fit="contain"
            style={[styles.floating, box]}
            iconSize={size.placeholderIcon}
          />
          {pinned && (
            <View style={styles.close}>
              <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  thumb: {
    width: size.listThumbnail,
    height: size.listThumbnail,
    borderRadius: radius.input,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    backgroundColor: colors.scrim,
  },
  floating: {
    borderRadius: radius.card,
  },
  // The ✕ on a round raised surface at the box's top-right corner, readable over any frame.
  close: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: size.iconButton / 2,
    backgroundColor: colors.surfaceRaised,
  },
}));
