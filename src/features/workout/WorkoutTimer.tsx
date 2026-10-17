import { ElapsedTimer } from '@/components/ElapsedTimer';
import { IconButton } from '@/components/IconButton';
import type { Session } from '@/db/types';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { setTimerPaused } from './actions';

/** The active workout's header: the timer and, beside it, the button that pauses or resumes it. */
export function WorkoutTimer({ session }: { session: Session }) {
  const { t } = useTranslation();
  const paused = session.pausedAt !== null;
  return (
    <View style={styles.row}>
      <ElapsedTimer
        start={session.startedAt}
        pausedAt={session.pausedAt}
        pausedMs={session.pausedMs}
      />
      <IconButton
        icon={paused ? 'play_arrow' : 'pause'}
        accessibilityLabel={t(paused ? 'workout.resumeTimer' : 'workout.pauseTimer')}
        onPress={() => setTimerPaused(session.id, !paused)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
