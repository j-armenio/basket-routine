import { formatElapsed } from '@/domain/format';
import { elapsedMs } from '@/domain/sessionTime';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { size, spacing } from '@/theme/spacing';
import { tabularNums } from '@/theme/typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText } from './AppText';
import { Icon } from './Icon';

const TICK_MS = 1000;

type ElapsedTimerProps = {
  start: Date;
  /** When the timer was paused; null (the default) while it runs. */
  pausedAt?: Date | null;
  /** The time spent paused before `pausedAt`, left out of the count. */
  pausedMs?: number;
};

/**
 * Milliseconds counted since `start`, pauses left out, re-rendered every second while running. Its
 * clock is read on mount: `ElapsedTimer` remounts it when the timer resumes.
 */
export function useElapsed({ start, pausedAt = null, pausedMs = 0 }: ElapsedTimerProps): number {
  const [now, setNow] = useState(() => Date.now());
  const paused = pausedAt !== null;
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [paused]);
  return elapsedMs({ startedAt: start, finishedAt: null, pausedAt, pausedMs }, new Date(now));
}

/**
 * The time counted since `start`, in a green pill; paused, it stays still in a grey pill with the
 * pause icon. Read from the clock every second, so it stays right after the screen or the app was
 * away.
 */
export function ElapsedTimer(props: ElapsedTimerProps) {
  // Remounted on pause and resume, so a resumed count reads the clock afresh, not from before.
  return <TimerPill key={props.pausedAt ? 'paused' : 'running'} {...props} />;
}

function TimerPill(props: ElapsedTimerProps) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const paused = !!props.pausedAt;
  const text = formatElapsed(useElapsed(props));
  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={t(paused ? 'workout.elapsedTimePaused' : 'workout.elapsedTime', {
        time: text,
      })}
      style={[styles.pill, paused && styles.pausedPill]}
    >
      <Icon
        name={paused ? 'pause' : 'timer'}
        size={size.iconSmall}
        color={paused ? colors.textSecondary : colors.onSecondary}
      />
      <AppText variant="bodySmall" weight="bold" style={[styles.text, paused && styles.pausedText]}>
        {text}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  pill: {
    height: size.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xsPlus,
    paddingLeft: spacing.md,
    paddingRight: spacing.mdPlus,
    borderRadius: size.pill / 2,
    backgroundColor: colors.secondary,
  },
  pausedPill: {
    backgroundColor: colors.surfaceRaised,
  },
  text: {
    ...tabularNums,
    color: colors.onSecondary,
  },
  pausedText: {
    color: colors.textSecondary,
  },
}));
