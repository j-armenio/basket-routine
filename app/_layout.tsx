import { useBlurOnKeyboardHide } from '@/components/useBlurOnKeyboardHide';
import { useDatabaseSetup } from '@/db/useDatabaseSetup';
import { LanguagePickerGate } from '@/features/settings/LanguagePickerGate';
import { readLanguage } from '@/features/settings/languageStorage';
import { askLanguageOnLaunch } from '@/features/settings/launchGate';
import '@/i18n/i18n';
import { fontFiles } from '@/theme/fonts';
import { useThemePreference } from '@/features/settings/hooks';
import { makeStyles } from '@/theme/makeStyles';
import { navigationThemeFor } from '@/theme/navigationTheme';
import type { ThemePreference } from '@/theme/scheme';
import { AppThemeProvider, useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import regular from 'expo-symbols/androidWeights/regular';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Appearance, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const preference = useThemePreference();
  return (
    <AppThemeProvider preference={preference}>
      <RootContent preference={preference} />
    </AppThemeProvider>
  );
}

function RootContent({ preference }: { preference: ThemePreference }) {
  const { t } = useTranslation();
  const { scheme, colors } = useTheme();
  const styles = useStyles();
  const { ready, error } = useDatabaseSetup();
  // Preloads the text and icon fonts behind the splash, so nothing redraws once they arrive. If
  // one fails we carry on: text falls back to the system font, icons to their empty box.
  const [fontsLoaded, fontError] = useFonts({ ...fontFiles, [regular.name]: regular.font });
  const fontsSettled = fontsLoaded || !!fontError;
  // The picker shows on every launch (the app already runs in the stored language behind it).
  const [languageChosen, setLanguageChosen] = useState(
    () => !askLanguageOnLaunch() && readLanguage() !== null,
  );
  useBlurOnKeyboardHide();

  // The native side follows the choice too: `Alert`s take the scheme, and the window background
  // is what shows behind a screen while it slides or the keyboard resizes the app.
  useEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const statusBarStyle = scheme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    if (error || (ready && fontsSettled)) SplashScreen.hideAsync();
  }, [ready, error, fontsSettled]);

  if (error) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>
          {t('common.databaseError', { message: error.message })}
        </Text>
        <StatusBar style={statusBarStyle} />
      </View>
    );
  }

  if (!ready || !fontsSettled) return null;

  return (
    // Gestures (swipe to delete a set) only work under this root view.
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={navigationThemeFor(scheme, colors)}>
        {!languageChosen ? (
          <LanguagePickerGate onChoose={() => setLanguageChosen(true)} />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="active-workout" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="edit-workout" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="edit-exercise" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_bottom' }} />
            {/* Drawing on the board must not start the back swipe. */}
            <Stack.Screen
              name="tactical-board"
              options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
            />
            <Stack.Screen name="add-exercise" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add-to-routine" options={{ presentation: 'modal' }} />
          </Stack>
        )}
        <StatusBar style={statusBarStyle} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles((colors) => ({
  root: {
    flex: 1,
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },
}));
