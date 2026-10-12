import { AppText } from '@/components/AppText';
import { makeStyles } from '@/theme/makeStyles';
import { border, opacity, size, spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';
import { discardWorkout } from './actions';
import { useInProgressSession } from './hooks';

/** "Workout in progress", above the tab bar on every tab. Renders nothing without a session. */
export function ResumeBanner() {
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const session = useInProgressSession();
  if (!session) return null;

  const confirmDiscard = () =>
    Alert.alert(t('workout.discardWorkoutTitle'), t('workout.discardWorkoutMessage'), [
      { text: t('workout.keepGoing'), style: 'cancel' },
      {
        text: t('workout.discard'),
        style: 'destructive',
        onPress: () => discardWorkout(session.id),
      },
    ]);

  return (
    <View style={styles.banner}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('workout.resumeLabel', { name: session.name })}
        onPress={() => router.push('/active-workout')}
        style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
      >
        <AppText variant="caption" weight="bold" tone="green">
          {t('workout.inProgress')}
        </AppText>
        <AppText variant="sectionTitle" numberOfLines={1}>
          {session.name}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('workout.discardWorkoutButton')}
        onPress={confirmDiscard}
        style={({ pressed }) => [styles.discard, pressed && styles.pressed]}
      >
        <AppText variant="bodySmall" weight="bold" tone="error">
          {t('workout.discard')}
        </AppText>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: border.hairline,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  resume: {
    flex: 1,
    minHeight: size.buttonPrimaryHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding + spacing.xs,
    paddingVertical: spacing.sm,
  },
  discard: {
    minHeight: size.buttonPrimaryHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    opacity: opacity.pressed,
  },
}));
