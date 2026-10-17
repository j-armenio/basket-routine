import { Icon } from '@/components/Icon';
import type { TacticalBoard } from '@/domain/tacticalBoard';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { border, opacity, radius, size, spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { describeBoard } from './boardDescription';
import { CourtBoard } from './CourtBoard';
import { COURT_ASPECT } from './courtGeometry';

type TacticalBoardSlotProps = {
  board: TacticalBoard | null;
  /** Names the thumbnail for screen readers. */
  exerciseName: string;
  /** Opens the editor. Absent: read only (History). */
  onOpen?: () => void;
  /**
   * `card` (default): below the header, centered, at most `size.boardThumbnailMax` wide; a badge
   * opens the editor. `icon`: a 48 dp
   * thumbnail sized like a header icon button, replacing the "add board" one once there is a
   * board (the template editor).
   */
  variant?: 'card' | 'icon';
};

/** The `icon` variant's court, inside its 48 dp button minus the frame's own border. */
const ICON_COURT_WIDTH = size.iconButton - 2 * border.hairline;

/**
 * An exercise's tactical board: nothing until there is one (the header's ⊞ icon adds it), then a
 * thumbnail that opens the editor — the whole court below the header (`card`), or a small one in
 * the header itself (`icon`).
 */
export function TacticalBoardSlot({
  board,
  exerciseName,
  onOpen,
  variant = 'card',
}: TacticalBoardSlotProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);

  if (!board) return null;

  if (variant === 'icon') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('tactical.openFor', { name: exerciseName })}
        accessibilityHint={describeBoard(t, board)}
        onPress={onOpen}
        style={({ pressed }) => [styles.iconTouch, pressed && styles.pressed]}
      >
        <View style={[styles.frame, styles.iconFrame]}>
          <CourtBoard board={board} width={ICON_COURT_WIDTH} compact />
        </View>
      </Pressable>
    );
  }

  const drawing = (
    <View
      style={styles.frame}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 2 * border.hairline)}
    >
      {width > 0 && <CourtBoard board={board} width={width} compact />}
    </View>
  );

  if (!onOpen) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={describeBoard(t, board)}
        style={styles.cardSlot}
      >
        {drawing}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('tactical.openFor', { name: exerciseName })}
      accessibilityHint={describeBoard(t, board)}
      onPress={onOpen}
      style={({ pressed }) => [styles.cardSlot, pressed && styles.pressed]}
    >
      {drawing}
      <View style={styles.badge}>
        <Icon name="open_in_full" size={size.iconSmall} color={colors.textPrimary} />
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  frame: {
    aspectRatio: COURT_ASPECT,
    borderRadius: radius.courtThumbnail,
    borderWidth: border.hairline,
    borderColor: colors.courtFrame,
    backgroundColor: colors.court,
    overflow: 'hidden',
  },
  // Centered in the card, a little narrower than it.
  cardSlot: {
    width: '100%',
    maxWidth: size.boardThumbnailMax,
    alignSelf: 'center',
  },
  // A header icon button's footprint, the (slightly shorter) court frame centered inside it.
  iconTouch: {
    width: size.iconButton,
    height: size.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFrame: {
    width: size.iconButton,
  },
  badge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: size.boardBadge,
    height: size.boardBadge,
    borderRadius: radius.boardBadge,
    backgroundColor: colors.boardBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: opacity.pressed,
  },
}));
