import type { ColorToken } from '@/theme/colors';
import { useColors } from '@/theme/ThemeContext';
import { fonts, type FontWeight } from '@/theme/fonts';
import { typography, type TypographyVariant } from '@/theme/typography';
import { Text, type TextProps } from 'react-native';

// Each tone is a color token, so the text follows the palette in use.
const toneTokens = {
  default: 'textPrimary',
  secondary: 'textSecondary',
  primary: 'primary',
  green: 'secondaryText',
  error: 'error',
  success: 'success',
  neutral: 'neutralStat',
} satisfies Record<string, ColorToken>;

export type TextTone = keyof typeof toneTokens;

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
  /** Overrides the variant's weight (the mockups set a few texts bolder than their size's default). */
  weight?: FontWeight;
};

export function AppText({
  variant = 'body',
  tone = 'default',
  weight,
  style,
  ...props
}: AppTextProps) {
  const colors = useColors();
  return (
    <Text
      style={[
        typography[variant],
        { color: colors[toneTokens[tone]] },
        weight && { fontFamily: fonts[weight] },
        style,
      ]}
      {...props}
    />
  );
}
