import { AppText } from '@/components/AppText';
import type { TargetMode } from '@/domain/types';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { columnRoles, setTable } from './setTable';

const MODE_SUBTITLE_KEY = {
  attempts: 'workout.modeSubtitleAttempts',
  makes: 'workout.modeSubtitleMakes',
} as const;

/** The line under an exercise's name: what its mode fixes, and what the user logs. */
export function modeSubtitle(t: TFunction, targetMode: TargetMode | null): string {
  return t(targetMode ? MODE_SUBTITLE_KEY[targetMode] : 'workout.modeSubtitleCheck');
}

type SetTableHeaderProps = {
  /** `null` for a `check` drill. */
  targetMode: TargetMode | null;
  /**
   * Drops the logged and FG% columns (and the DONE column of a check drill), for the template
   * editor: the target is the only value, so its column takes the rest of the row.
   */
  hideLogged?: boolean;
  /** The history's read-only table: MAKES and ATTEMPTS share the room evenly. */
  readOnly?: boolean;
};

/** The column titles above an exercise's sets, lined up with `setTable`. */
export function SetTableHeader({
  targetMode,
  hideLogged = false,
  readOnly = false,
}: SetTableHeaderProps) {
  const { t } = useTranslation();
  const numberColumn = (
    <View style={setTable.numberColumn}>
      <HeaderLabel>{t('workout.columnSet')}</HeaderLabel>
    </View>
  );

  if (targetMode === null) {
    return (
      <View style={setTable.row}>
        {numberColumn}
        {!hideLogged && (
          <View style={setTable.doneColumn}>
            <HeaderLabel>{t('workout.columnDone')}</HeaderLabel>
          </View>
        )}
      </View>
    );
  }

  if (hideLogged) {
    return (
      <View style={setTable.row}>
        {numberColumn}
        <View style={setTable.loggedColumn}>
          <HeaderLabel>
            {t(targetMode === 'attempts' ? 'workout.columnAttempts' : 'workout.columnMakes')}
          </HeaderLabel>
        </View>
      </View>
    );
  }

  const roles = columnRoles(targetMode);
  const column = (role: 'logged' | 'target') =>
    readOnly
      ? setTable.valueColumn
      : role === 'logged'
        ? setTable.loggedColumn
        : setTable.targetColumn;
  return (
    <View style={setTable.row}>
      {numberColumn}
      <View style={column(roles.makes)}>
        <HeaderLabel>{t('workout.columnMakes')}</HeaderLabel>
      </View>
      <View style={column(roles.attempts)}>
        <HeaderLabel>{t('workout.columnAttempts')}</HeaderLabel>
      </View>
      <View style={setTable.fgColumn}>
        <HeaderLabel>{t('workout.columnFgPct')}</HeaderLabel>
      </View>
    </View>
  );
}

function HeaderLabel({ children }: { children: string }) {
  return (
    <AppText variant="label" tone="secondary" style={styles.label}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
  },
});
