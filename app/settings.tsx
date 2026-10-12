import appConfig from '../app.json';
import { AppText } from '@/components/AppText';
import { ChipRow } from '@/components/ChipRow';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { setLanguage, setThemePreference } from '@/features/settings/actions';
import { useLanguage, useThemePreference } from '@/features/settings/hooks';
import { leaveScreen } from '@/features/workout/navigation';
import { THEME_PREFERENCES } from '@/theme/scheme';
import { spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

/** The app's settings, opened from the Profile tab: the theme, the language, and the app version at the bottom. */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { code, languages } = useLanguage();
  const themePreference = useThemePreference();

  return (
    <Screen
      title={t('settings.title')}
      titleVariant="titleLarge"
      left={
        <IconButton
          icon="arrow_back"
          accessibilityLabel={t('common.back')}
          onPress={() => leaveScreen(router)}
        />
      }
      bottomInset
    >
      <View style={styles.section}>
        <AppText variant="subtitle" weight="bold" tone="secondary" accessibilityRole="header">
          {t('settings.appearance')}
        </AppText>
        <ChipRow
          options={THEME_PREFERENCES.map((preference) => ({
            value: preference,
            label: t(`settings.theme.${preference}`),
          }))}
          value={themePreference}
          onChange={setThemePreference}
          wrap
        />
        <AppText variant="caption" tone="secondary">
          {t('settings.themeHint')}
        </AppText>
      </View>
      <View style={styles.section}>
        <AppText variant="subtitle" weight="bold" tone="secondary" accessibilityRole="header">
          {t('settings.language')}
        </AppText>
        <ChipRow
          options={languages.map((language) => ({ value: language.code, label: language.name }))}
          value={code}
          onChange={setLanguage}
          wrap
        />
      </View>
      <AppText variant="caption" tone="secondary" style={styles.version}>
        {t('settings.version', { version: appConfig.expo.version })}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  version: {
    textAlign: 'center',
  },
});
