import { AppText } from '@/components/AppText';
import { BottomActionBar } from '@/components/BottomActionBar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipRow } from '@/components/ChipRow';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import type { DomainErrorReason } from '@/domain/errors';
import {
  decodeTransfer,
  readQrLink,
  type ParseResult,
  type WorkoutTransfer,
} from '@/domain/workoutTransfer';
import { importWorkout } from '@/features/routines/actions';
import { useRoutines } from '@/features/routines/hooks';
import {
  pickTransferFile,
  previewTransfer,
  type TransferPreview,
} from '@/features/routines/workoutTransfer';
import { leaveScreen } from '@/features/workout/navigation';
import { makeStyles } from '@/theme/makeStyles';
import { radius, spacing } from '@/theme/spacing';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

type Loaded = { transfer: WorkoutTransfer; preview: TransferPreview };

/** A read transfer ready to preview, or why it can't be imported (including a `seedKey` we lack). */
function checkTransfer(result: ParseResult): Loaded | { reason: DomainErrorReason } {
  if (!result.ok) return { reason: result.reason };
  const preview = previewTransfer(result.transfer);
  return preview.unknown ? { reason: 'unknown_exercise' } : { transfer: result.transfer, preview };
}

/**
 * Import Workout, from a routine's menu on the Workout tab: choose a file or scan a QR code, see
 * what it holds and which routine it goes into, then import. The workout opens in the template
 * editor, like Add to Routine does. Opened by a `basketroutine://import-workout?d=…` link (the
 * system camera reading a QR code), it starts at the preview.
 */
export default function ImportWorkoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const { routineId, d } = useLocalSearchParams<{ routineId?: string; d?: string }>();
  const routines = useRoutines();
  const [permission, requestPermission] = useCameraPermissions();
  const [linked] = useState(() => (d ? checkTransfer(decodeTransfer(d)) : null));
  const [loaded, setLoaded] = useState<Loaded | null>(
    linked && 'transfer' in linked ? linked : null,
  );
  const [message, setMessage] = useState<string | null>(
    linked && 'reason' in linked ? t(`errors.${linked.reason}`) : null,
  );
  const [scanning, setScanning] = useState(false);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  // A scan fires many times a second: act on the first good code, and say once about a bad one.
  const scanDone = useRef(false);
  const lastBadScan = useRef<string | null>(null);

  const close = (
    <IconButton
      icon="close"
      accessibilityLabel={t('common.close')}
      onPress={() => leaveScreen(router)}
    />
  );
  const title = t('transfer.importTitle');

  if (routines.length === 0) {
    return (
      <Screen title={title} titleVariant="title" left={close} bottomInset>
        <EmptyState
          icon="sports_basketball"
          title={t('transfer.noRoutinesTitle')}
          message={t('transfer.noRoutinesMessage')}
        />
      </Screen>
    );
  }

  const accept = (checked: Loaded | { reason: DomainErrorReason }) => {
    if ('transfer' in checked) {
      setLoaded(checked);
      setMessage(null);
    } else {
      setMessage(t(`errors.${checked.reason}`));
    }
  };

  const chooseFile = async () => {
    const picked = await pickTransferFile();
    if (picked.kind === 'unreadable') setMessage(t('transfer.readFailedMessage'));
    else if (picked.kind === 'read') accept(checkTransfer(picked.result));
  };

  const startScanning = () => {
    scanDone.current = false;
    lastBadScan.current = null;
    setMessage(null);
    setScanning(true);
  };

  const onScanned = ({ data }: { data: string }) => {
    if (scanDone.current || data === lastBadScan.current) return;
    const encoded = readQrLink(data);
    const checked = encoded === null ? null : checkTransfer(decodeTransfer(encoded));
    if (checked && 'transfer' in checked) {
      scanDone.current = true;
      setScanning(false);
      accept(checked);
    } else {
      lastBadScan.current = data;
      accept(checked ?? { reason: 'invalid_transfer' });
    }
  };

  if (loaded) {
    const { transfer, preview } = loaded;
    const fallback = routines.find((routine) => routine.id === Number(routineId)) ?? routines[0];
    const destination =
      routines.find((routine) => String(routine.id) === destinationId) ?? fallback;

    const confirm = () => {
      const result = importWorkout(destination.id, transfer);
      if (result.ok) {
        router.replace({ pathname: '/edit-workout', params: { workoutId: result.value.id } });
      } else {
        Alert.alert(t('transfer.importFailedTitle'), t(`errors.${result.reason}`));
      }
    };

    return (
      <Screen
        title={title}
        titleVariant="title"
        left={close}
        footer={<BottomActionBar label={t('transfer.import')} icon="download" onPress={confirm} />}
        bottomInset
      >
        <Card style={styles.card}>
          <AppText variant="cardTitle">{transfer.name}</AppText>
          <AppText variant="sectionTitle" accessibilityRole="header">
            {t('transfer.previewExercises')}
          </AppText>
          {preview.names.map((name, index) => (
            <AppText key={`${index}-${name}`} variant="bodySmall" tone="secondary">
              {name}
            </AppText>
          ))}
          {preview.newCustom > 0 && (
            <AppText variant="bodySmall" tone="secondary">
              {t('transfer.newCustom', { count: preview.newCustom })}
            </AppText>
          )}
        </Card>
        <AppText variant="sectionTitle" accessibilityRole="header">
          {t('transfer.destination')}
        </AppText>
        <ChipRow
          wrap
          options={routines.map((routine) => ({ value: String(routine.id), label: routine.name }))}
          value={String(destination.id)}
          onChange={setDestinationId}
        />
      </Screen>
    );
  }

  if (scanning) {
    const granted = permission?.granted === true;
    return (
      <Screen
        title={t('transfer.scanQr')}
        titleVariant="title"
        left={
          <IconButton
            icon="close"
            accessibilityLabel={t('transfer.stopScanning')}
            onPress={() => setScanning(false)}
          />
        }
        scroll={false}
        bottomInset
      >
        {granted ? (
          <View style={styles.scanner}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onScanned}
            />
            <AppText variant="bodySmall" tone="secondary" style={styles.centered}>
              {t('transfer.scanning')}
            </AppText>
            {message && (
              <AppText variant="bodySmall" tone="error" style={styles.centered}>
                {message}
              </AppText>
            )}
          </View>
        ) : (
          <EmptyState
            icon="qr_code_scanner"
            title={t('transfer.cameraDeniedTitle')}
            message={t('transfer.cameraDeniedMessage')}
            action={{ label: t('transfer.allowCamera'), onPress: () => requestPermission() }}
          />
        )}
      </Screen>
    );
  }

  return (
    <Screen title={title} titleVariant="title" left={close} bottomInset>
      <AppText tone="secondary">{t('transfer.sourceMessage')}</AppText>
      <Button label={t('transfer.chooseFile')} icon="folder_open" fullWidth onPress={chooseFile} />
      <Button
        variant="secondary"
        label={t('transfer.scanQr')}
        icon="qr_code_scanner"
        fullWidth
        onPress={startScanning}
      />
      {message && (
        <AppText variant="bodySmall" tone="error" accessibilityRole="alert">
          {message}
        </AppText>
      )}
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    gap: spacing.sm,
  },
  scanner: {
    flex: 1,
    gap: spacing.md,
  },
  camera: {
    flex: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  centered: {
    textAlign: 'center',
  },
}));
