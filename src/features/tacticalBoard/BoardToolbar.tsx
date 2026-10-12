import { Icon } from '@/components/Icon';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { border, opacity, radius, size, spacing } from '@/theme/spacing';
import type { AndroidSymbol } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BoardTool } from './boardEditor';

const TOOLS: {
  value: BoardTool;
  labelKey:
    | 'tactical.toolHand'
    | 'tactical.toolX'
    | 'tactical.toolArrow'
    | 'tactical.toolPen'
    | 'tactical.toolEraser';
  icon: AndroidSymbol;
}[] = [
  { value: 'hand', labelKey: 'tactical.toolHand', icon: 'pan_tool' },
  { value: 'x', labelKey: 'tactical.toolX', icon: 'close' },
  { value: 'arrow', labelKey: 'tactical.toolArrow', icon: 'arrow_outward' },
  { value: 'pen', labelKey: 'tactical.toolPen', icon: 'edit' },
  { value: 'eraser', labelKey: 'tactical.toolEraser', icon: 'ink_eraser' },
];

type BoardToolbarProps = {
  tool: BoardTool;
  onTool: (tool: BoardTool) => void;
  /** Undo is off with nothing to undo. */
  canUndo: boolean;
  /** Clear is off on an empty board. */
  hasMarks: boolean;
  onUndo: () => void;
  onClear: () => void;
};

/**
 * The editor's tools, fixed at the bottom within the thumb's reach, in two rows: Undo and Clear
 * above, right-aligned in their own small rectangle; the 5 tools below, centered, in the bar that
 * spans the screen's width (one selected, filled pink). Goes in `Screen`'s `footer`.
 */
export function BoardToolbar({
  tool,
  onTool,
  canUndo,
  hasMarks,
  onUndo,
  onClear,
}: BoardToolbarProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['bottom']} style={styles.bar}>
      <View style={styles.actions}>
        <Action icon="undo" label={t('tactical.undo')} disabled={!canUndo} onPress={onUndo} />
        <Action
          icon="delete"
          label={t('tactical.clearBoard')}
          disabled={!hasMarks}
          onPress={onClear}
        />
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('tactical.drawingTools')}
        style={styles.tools}
      >
        {TOOLS.map((item) => {
          const selected = item.value === tool;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="radio"
              accessibilityLabel={t(item.labelKey)}
              accessibilityState={{ selected }}
              onPress={() => onTool(item.value)}
              style={({ pressed }) => [
                styles.tool,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Icon
                name={item.icon}
                size={size.iconLarge}
                color={selected ? colors.onPrimary : colors.textPrimary}
              />
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function Action({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: AndroidSymbol;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Icon name={icon} size={size.iconLarge} color={colors.iconMuted} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  // No background of its own: only the tools row below (the actual "bar") is filled, so it alone
  // reads as covering the bottom of the screen.
  bar: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  // Right-aligned above the tools row, in its own small rectangle: two icons don't need a whole
  // line's width.
  actions: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: spacing.md,
    gap: spacing.xs,
    padding: spacing.xxs,
    borderRadius: radius.boardTool,
    backgroundColor: colors.backgroundDeep,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: border.hairline,
    borderTopColor: colors.divider,
    backgroundColor: colors.backgroundDeep,
  },
  tool: {
    width: size.boardTool,
    height: size.boardTool,
    borderRadius: radius.boardTool,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
  },
  action: {
    width: size.boardAction,
    height: size.boardAction,
    borderRadius: radius.boardTool,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
  },
}));
