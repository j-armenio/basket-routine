import { ActionSheet } from '@/components/ActionSheet';
import type { TargetMode } from '@/domain/types';
import { useTranslation } from 'react-i18next';

type TargetModeSheetProps = {
  /** The shooting drill being added; `null` keeps the sheet closed. */
  exerciseName: string | null;
  onPick: (targetMode: TargetMode) => void;
  onClose: () => void;
};

/** Asks which value a shooting drill fixes, before it is added (to a session or a template). */
export function TargetModeSheet({ exerciseName, onPick, onClose }: TargetModeSheetProps) {
  const { t } = useTranslation();
  return (
    <ActionSheet
      visible={exerciseName !== null}
      title={exerciseName ? t('workout.targetModeSheetTitle', { name: exerciseName }) : undefined}
      options={[
        {
          label: t('workout.targetModeFixedAttempts'),
          icon: 'sports_basketball',
          onPress: () => onPick('attempts'),
        },
        {
          label: t('workout.targetModeFixedMakes'),
          icon: 'check',
          onPress: () => onPick('makes'),
        },
      ]}
      onClose={onClose}
    />
  );
}
