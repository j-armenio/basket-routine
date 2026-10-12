import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { opacity, size, spacing } from '@/theme/spacing';
import type { AndroidSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { AppText } from './AppText';
import { Icon } from './Icon';

type ListItemProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  /** A string, or texts of their own (a colored tag). */
  subtitle?: ReactNode;
  rightIcon?: AndroidSymbol;
  /** Before the texts (a thumbnail). */
  left?: ReactNode;
};

/**
 * A pressable row on the screen's background: an optional element on the left (a 64 dp thumbnail),
 * a title, an optional subtitle and an optional icon on the right.
 */
export function ListItem({ title, subtitle, rightIcon, left, ...props }: ListItemProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {left}
      <View style={styles.texts}>
        <AppText variant="sectionTitle" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle !== undefined && (
          <AppText variant="subtitle" tone="secondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        )}
      </View>
      {rightIcon && <Icon name={rightIcon} size={size.icon} color={colors.iconMuted} />}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    minHeight: size.buttonPrimaryHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
}));
