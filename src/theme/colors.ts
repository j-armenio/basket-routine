// The color tokens, by role (docs/design.md). Two palettes with the same tokens: dark (the default)
// and light. Screens never import a palette: they read it through `useColors()` / `makeStyles`.
export const darkColors = {
  /** Screen background. */
  background: '#1E1E24',
  /** The tab bar and the fixed bottom action bars. */
  backgroundDeep: '#121215',
  /** Cards, unselected chips, text fields. */
  surface: '#282830',
  /** Items and fields inside cards. */
  surfaceRaised: '#32323C',
  /** Top border of the fixed bars. */
  divider: '#2E2E36',
  /** Unselected chip border, dividers inside cards, chart grid. */
  outline: '#3A3A44',
  /** An empty check box's border (3:1 on surface). */
  outlineStrong: '#7A7C88',
  textPrimary: '#F5F6F8',
  /** Captions, labels, placeholders. */
  textSecondary: '#B4B6C0',
  /** Menu ⋮, chevrons, trash. */
  iconMuted: '#C4C6D0',
  /** The ball in media placeholders. */
  iconPlaceholder: '#8A8C96',
  /** Main actions: Start, Finish, Save, Done, Add to Routine, the FAB, Add Set, the chart line. */
  primary: '#F47C98',
  onPrimary: '#1E1E24',
  /** Behind the round play button. */
  primaryContainer: '#3A2830',
  /** Selected chips, the active tab, a done check box, the timer, New Routine. */
  secondary: '#2B5840',
  onSecondary: '#F5F6F8',
  /** Green outlines (the logged number field, New Workout, Choose media). */
  secondaryOutline: '#4E8F6B',
  /** Green text on the dark background (active tab label, New Workout, the Custom tag). */
  secondaryText: '#A8D5BA',
  /** FG% above 60%, a done check. */
  success: '#7FD1A0',
  /** FG% below 40%, Discard Workout, validation messages. */
  error: '#FF9580',
  /** FG% from 40 to 60%. */
  neutralStat: '#C4C6D0',
  /** The tactical board's court: the floor, its outline, the paint, the three-point area. */
  court: '#2B5840',
  courtFrame: '#3E7258',
  courtPaint: '#24503A',
  courtArc: '#2D5B44',
  /** The court's lines. */
  courtLine: '#A8D5BA',
  /** X marks and arrows on the board. */
  boardMark: '#F5F6F8',
  /** Behind a mark's outline on the board. */
  boardMarkOutline: '#121215',
  /** Pen strokes on the board. */
  boardPen: '#F47C98',
  /** Under every mark on the board, so it stands out from the lines. */
  boardHalo: 'rgba(16, 36, 26, 0.85)',
  /** Behind the thumbnail's expand icon. */
  boardBadge: 'rgba(18, 18, 21, 0.7)',
  /** Behind modals (dialogs, action sheets). Not a text color. */
  scrim: 'rgba(0, 0, 0, 0.6)',
};

export type ColorToken = keyof typeof darkColors;
export type Palette = Record<ColorToken, string>;

/** The light palette. The tactical board is a picture, not an app surface: its tokens (`court*`,
 *  `board*`) keep the dark values. */
export const lightColors: Palette = {
  ...darkColors,
  background: '#F5F6F8',
  backgroundDeep: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceRaised: '#EEF0F3',
  divider: '#E2E4E9',
  outline: '#D3D6DD',
  outlineStrong: '#868995',
  textPrimary: '#1E1E24',
  textSecondary: '#5A5D69',
  iconMuted: '#50535E',
  iconPlaceholder: '#8A8C96',
  primary: '#C2335A',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FDEEF2',
  secondary: '#D2EADC',
  onSecondary: '#14331F',
  secondaryOutline: '#3F7A5A',
  secondaryText: '#2A6646',
  success: '#1B7342',
  error: '#B83A2A',
  neutralStat: '#5A5D69',
  scrim: 'rgba(0, 0, 0, 0.4)',
};
