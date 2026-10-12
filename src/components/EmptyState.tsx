import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { size, spacing } from '@/theme/spacing';
import type { AndroidSymbol } from 'expo-symbols';
import { View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

type EmptyStateProps = {
  icon: AndroidSymbol;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Icon name={icon} size={size.placeholderIcon} color={colors.iconPlaceholder} />
      <AppText variant="cardTitle" style={styles.centered}>
        {title}
      </AppText>
      {message && (
        <AppText variant="bodySmall" tone="secondary" style={styles.centered}>
          {message}
        </AppText>
      )}
      {action && <Button variant="secondary" label={action.label} onPress={action.onPress} />}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  centered: {
    textAlign: 'center',
  },
}));
