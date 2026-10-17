import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { QrCode } from '@/features/routines/QrCode';
import { exportWorkoutFile, workoutQrLink } from '@/features/routines/workoutTransfer';
import { leaveScreen } from '@/features/workout/navigation';
import { spacing } from '@/theme/spacing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, useWindowDimensions, View } from 'react-native';

const MAX_QR_SIZE = 360;

/**
 * A workout shown as a QR code to scan from another phone (Import workout, on the Workout tab).
 * When the workout is too big for one, the file export is offered instead.
 */
export default function WorkoutQrScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const qr = useMemo(() => workoutQrLink(Number(workoutId)), [workoutId]);
  const close = (
    <IconButton
      icon="close"
      accessibilityLabel={t('common.close')}
      onPress={() => leaveScreen(router)}
    />
  );

  const exportFile = async () => {
    if (!(await exportWorkoutFile(Number(workoutId), t('transfer.shareTitle')))) {
      Alert.alert(t('transfer.exportFailedTitle'), t('transfer.exportFailedMessage'));
    }
  };

  if (!qr.ok) {
    const tooLarge = qr.reason === 'too_large';
    return (
      <Screen title={t('transfer.qrTitle')} titleVariant="title" left={close} bottomInset>
        <EmptyState
          icon="qr_code_2"
          title={t(tooLarge ? 'transfer.qrTooLargeTitle' : 'transfer.workoutNotFound')}
          message={tooLarge ? t('transfer.qrTooLargeMessage') : undefined}
          action={tooLarge ? { label: t('transfer.exportFile'), onPress: exportFile } : undefined}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={t('transfer.qrTitle')}
      titleVariant="title"
      subtitle={qr.name}
      left={close}
      bottomInset
    >
      <View style={styles.center}>
        <QrCode
          value={qr.link}
          size={Math.min(width - spacing.screenPadding * 2, MAX_QR_SIZE)}
          accessibilityLabel={t('transfer.qrLabel', { name: qr.name })}
        />
        <AppText variant="bodySmall" tone="secondary" style={styles.hint}>
          {t('transfer.qrHint')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  hint: {
    textAlign: 'center',
  },
});
