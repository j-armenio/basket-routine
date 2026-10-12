import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { makeStyles } from '@/theme/makeStyles';
import { useColors } from '@/theme/ThemeContext';
import { border, opacity, radius, size, spacing } from '@/theme/spacing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { setLanguage } from './actions';
import { LANGUAGES, type LanguageCode } from './languages';
import { readLanguage } from './languageStorage';

type LanguagePickerGateProps = {
  /** Called once a language is confirmed (after it's persisted and the app has switched to it). */
  onChoose: () => void;
};

/**
 * Shown instead of the `Stack` on every launch: a title, the languages (each named in itself) and
 * a confirm button. The stored language (English on the first launch) starts selected; the title
 * and the button follow the selection, read with a fixed `t` so the app's language only changes on
 * confirm. Not a routable screen.
 */
export function LanguagePickerGate({ onChoose }: LanguagePickerGateProps) {
  const styles = useStyles();
  const colors = useColors();
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState<LanguageCode>(() => readLanguage() ?? 'en');
  const t = i18n.getFixedT(selected);

  const confirm = () => {
    setLanguage(selected);
    onChoose();
  };

  return (
    <View style={styles.root}>
      <AppText variant="headline" accessibilityRole="header" style={styles.title}>
        {t('languagePicker.title')}
      </AppText>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {LANGUAGES.map((language) => {
          const isSelected = language.code === selected;
          return (
            <Pressable
              key={language.code}
              accessibilityRole="radio"
              accessibilityLabel={language.name}
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelected(language.code)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <AppText variant="sectionTitle" style={styles.optionName}>
                {language.name}
              </AppText>
              {isSelected && (
                <Icon
                  name="check"
                  size={size.icon}
                  color={colors.onSecondary}
                  testID={`${language.name} selected`}
                />
              )}
            </Pressable>
          );
        })}
      </View>
      <Button variant="primary" label={t('languagePicker.confirm')} fullWidth onPress={confirm} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
    padding: spacing.screenPadding,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
  },
  options: {
    gap: spacing.md,
  },
  // The selected row is green with a check icon, so the color isn't the only signal.
  option: {
    minHeight: size.buttonPrimaryHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.cardPaddingCompact,
    borderRadius: radius.button,
    borderWidth: border.outline,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.secondaryOutline,
    backgroundColor: colors.secondary,
  },
  optionName: {
    flex: 1,
  },
  pressed: {
    opacity: opacity.pressed,
  },
}));
