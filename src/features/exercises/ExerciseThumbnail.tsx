import { IconButton } from '@/components/IconButton';
import { makeStyles } from '@/theme/makeStyles';
import { opacity, radius, size, spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useExercise } from './hooks';
import { exerciseMedia, type MediaSource } from './mediaSource';
import { MediaPlaceholder, MediaView } from './MediaView';
import { useVideoThumbnail } from './videoThumbnail';

type ExerciseThumbnailProps = {
  exerciseId: number;
  /** The card's name for it (a session keeps its own snapshot of the name). */
  name: string;
};

/** How the floating media was opened: held (it closes on release) or tapped (it stays). */
type Floating = 'held' | 'pinned';

/** How long the finger rests on the thumbnail before a hold opens the media. */
const HOLD_MS = 250;

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

  // The hold is a gesture-handler pan that activates once the finger has rested `HOLD_MS`. Active,
  // it owns the touch until the finger lifts: the screen's scroll view can't take it over as the
  // finger drifts while watching, which used to end a `Pressable` long press at random. Moving
  // before then fails it, so a scroll that starts on the thumbnail still scrolls. A tap stays on
  // the `Pressable` (also what TalkBack activates); the hold's activation cancels the `Pressable`'s
  // touch, so its release isn't taken for a tap.
  const hold = Gesture.Pan()
    .activateAfterLongPress(HOLD_MS)
    .runOnJS(true)
    .onStart(() => setFloating('held'))
    .onFinalize(() => setFloating((current) => (current === 'held' ? null : current)))
    .withTestId(`media-hold-${exerciseId}`);

  if (!media) return <MediaPlaceholder style={styles.thumb} iconSize={size.iconLarge} />;
  const close = () => setFloating(null);
  return (
    <>
      <GestureDetector gesture={hold}>
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('exercises.playMediaFor', { name })}
            accessibilityHint={t('exercises.holdToPlay')}
            onPress={() => setFloating((current) => current ?? 'pinned')}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <MediaView
              media={media}
              playing={false}
              style={styles.thumb}
              iconSize={size.iconLarge}
            />
          </Pressable>
        </View>
      </GestureDetector>
      <FloatingMedia media={media} mode={floating} onClose={close} />
    </>
  );
}

/** Tall portrait (9:16), like the bundled clips; `contain` fits any other shape inside it. */
const FLOATING_ASPECT = 9 / 16;
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
  // A video's box takes the video's own shape (from its first frame, already made for the card's
  // still). In a box of another shape, ExoPlayer has to center the picture itself once it learns the
  // video's size, and on a first open that comes after the layout: the video showed stretched to one
  // side until it had been opened a few times.
  const frame = useVideoThumbnail(media.kind === 'video' ? media.source : undefined);
  const aspect =
    frame && frame.width > 0 && frame.height > 0 ? frame.width / frame.height : FLOATING_ASPECT;
  const width = Math.min(
    window.width - 2 * spacing.screenPadding,
    window.height * FLOATING_MAX_HEIGHT * aspect,
  );
  const box = { width, height: width / aspect };
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
