import { darkColors, lightColors, type ColorToken, type Palette } from './colors';

function channel(hex: string, start: number) {
  const value = parseInt(hex.slice(start, start + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

function contrast(foreground: string, background: string) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

type Token = ColorToken;

// Every text-on-background pair the design uses. Outlines and the empty check box's border are
// non-text (3:1), and the scrim isn't a color text sits on.
const readablePairs: [Token, Token][] = [
  ...(['background', 'backgroundDeep', 'surface', 'surfaceRaised'] as const).flatMap(
    (background): [Token, Token][] => [
      ['textPrimary', background],
      ['textSecondary', background],
      ['iconMuted', background],
      ['success', background],
      ['error', background],
      ['neutralStat', background],
      ['secondaryText', background],
      ['primary', background],
    ],
  ),
  ['onPrimary', 'primary'],
  ['primary', 'primaryContainer'],
  ['onSecondary', 'secondary'],
];

// The tactical board's marks and lines are graphics (3:1) on the court's floor and paint.
const boardPairs: [Token, Token][] = (['court', 'courtPaint', 'courtArc'] as const).flatMap(
  (floor): [Token, Token][] => [
    ['boardMark', floor],
    ['boardPen', floor],
    ['courtLine', floor],
  ],
);

const palettes: [string, Palette][] = [
  ['dark', darkColors],
  ['light', lightColors],
];

describe.each(palettes)('%s palette', (_name, colors) => {
  test.each(readablePairs)('%s on %s has at least 4.5:1 contrast', (foreground, background) => {
    expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(4.5);
  });

  test.each(boardPairs)('%s on %s has at least 3:1 contrast', (foreground, background) => {
    expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(3);
  });

  test('the empty check box border has at least 3:1 contrast on surface', () => {
    expect(contrast(colors.outlineStrong, colors.surface)).toBeGreaterThanOrEqual(3);
  });
});

test('the tactical board looks the same in both palettes', () => {
  const boardTokens = Object.keys(darkColors).filter(
    (token) => token.startsWith('court') || token.startsWith('board') || token.startsWith('qr'),
  ) as Token[];
  for (const token of boardTokens) expect(lightColors[token]).toBe(darkColors[token]);
});
