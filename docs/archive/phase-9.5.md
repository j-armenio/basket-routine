# Phase 9.5 — Language and theme

Detailed plan for Phase 9.5 of [PLAN.md](PLAN.md), inserted between Phase 9 (Refinement) and Phase 10 (Testing & Release) after it came up as a developer idea once Phase 9 was already committed. Two parts, both settings in the same Settings screen: **Part A — Language** (below, code done) and **[Part B — Light theme](#part-b--light-theme)** (added 2026-10-07, not started).

**Goal:** the user picks a language on first launch, and can change it later from Settings; every screen's text updates immediately, with no restart needed, and the app reopens in the chosen language. The user can also pick Light, Dark or System in Settings; colors change immediately, and the app reopens in the chosen theme.

**Done when:** the first-launch picker and the Settings language switch both work on the phone in English and Brazilian Portuguese; the theme switch works on the phone in its three modes and every screen reads well in the light theme; the full CI list passes, and CI is green on the phase commits.

# Part A — Language

## Decisions for this phase

| Topic | Decision |
|---|---|
| Languages at launch | English (`en`, dates as `en-US`) and Brazilian Portuguese (`pt-BR`) |
| i18n library | `i18next` + `react-i18next`, installed with approval |
| Device-locale suggestion | none: the first-launch picker preselects English; the user selects one of the two options and confirms. `expo-localization` (reads the phone's language) is not installed; it can come later if wanted |
| Persistence | `src/features/settings/languageStorage.ts`, a key (`settings.language`) in `expo-sqlite/kv-store`, the same mechanism as the profile's name and photo (`src/features/profile/profileStorage.ts`); outside the schema, no migration. `languageStorage.ts` becomes the second file allowed to import the kv-store |
| Boot | `src/i18n/i18n.ts` initializes with the stored language, read synchronously (`getItemSync`), falling back to `en` when none is stored, so the first screen is already in the right language |
| First launch | gated in `app/_layout.tsx`, the same place that already runs migrations and preloads fonts behind the splash screen: once the splash hides, if no language is stored yet, a picker renders instead of the `Stack` (still inside `GestureHandlerRootView` / `ThemeProvider`) |
| Live switching | `react-i18next`'s `useTranslation()` re-renders the components that call it when the language changes; no `dataStore` involvement. Text built outside a component (pure helpers, memoized option lists) gets `t` or its labels from the caller, and every `useMemo` holding text depends on the language |
| Dictionaries | nested objects grouped by feature (`common`, `workout`, `routines`, `history`, `exercises`, `profile`, `settings`, `tactical`, `errors`, `labels`); keys typed from `en.ts` through i18next's `CustomTypeOptions`, so a wrong key fails `typecheck`; `pt-BR.ts` typed against the same shape, so a missing key fails `typecheck` too |
| Plurals | i18next's `_one` / `_other` keys with `count` ("1 exercise" / "8 exercises", "+N more"), which need `Intl.PluralRules` (checked in step 1) |
| FG% | unchanged in both languages: `45.3%`, with a dot, as today |
| Predefined exercise names | **stay in English** regardless of the app's language — translating 38 drill names/descriptions is content work, not UI chrome. Only the fixed enum labels (category, `trackingType`, `targetMode`) are translated, at render time, so a past session's category shows in the current language |
| Names saved in the DB | the one name the app writes on its own, an empty workout's "Morning / Afternoon / Evening Workout", is saved in the language active when the workout starts, and keeps that text afterward like any session snapshot |
| Domain purity | `src/domain/` stays free of i18n imports and of user-facing English text: error reasons, enum values and numbers go out of it, the UI layer turns them into words |
| Working convention | `CLAUDE.md`'s "UI and code are in English throughout" becomes: code, comments and docs in English; every user-facing text (labels, accessibility labels, alerts) only through `src/i18n/`'s dictionaries |

## Out of scope (left for later / backlog)

- Translating predefined exercise names and descriptions.
- Languages beyond English/Brazilian Portuguese (same mechanism, add a dictionary later).
- Renaming names already saved in the DB (a session's or a template's name) when the language changes.
- Reading the phone's language (`expo-localization`).

## Tools

Nothing is installed without asking first.

| Tool | What it does | Where it runs |
|---|---|---|
| `i18next` + `react-i18next` | Dictionary lookup, interpolation, plurals, live language switching | Project `node_modules/` only |
| `intl-pluralrules` (only if step 1 finds it missing) | Polyfill for `Intl.PluralRules`, which i18next's plurals need | Project `node_modules/` only |

## Steps

Each step lands with its own tests; the full suite stays green between steps.

### 1. Install the libraries, check plurals
Ask for approval, then `npm install i18next react-i18next`. Confirm `npx expo-doctor` stays clean. In Expo Go on the phone, check that `Intl.PluralRules` exists (Hermes); if it doesn't, ask approval for the `intl-pluralrules` polyfill, imported once at the top of `src/i18n/i18n.ts`.

### 2. `src/i18n/`
- `translations/en.ts`, `translations/pt-BR.ts`: nested dictionaries per the decision above; `errors` is typed `Record<DomainErrorReason, string>`, so a new reason still fails `typecheck` as `messages.ts` does today.
- `i18n.ts`: `i18next.use(initReactI18next).init({ resources, lng: readLanguage() ?? 'en', fallbackLng: 'en' })`, imported once from `app/_layout.tsx` before the first render; `i18next.d.ts` declares `CustomTypeOptions` from `en.ts`.
- `format.ts` (UI layer, takes `t` and/or the locale): the formatting that has words (duration, exercise list, chart range labels), built on the number-only helpers left in `src/domain/` (step 4).
- Test: `en` and `pt-BR` have the exact same set of keys (a backstop for the type check).

### 3. `src/features/settings/`
New feature folder, same shape as the others:
- `languageStorage.ts`: `readLanguage()` / `writeLanguage(code)` in `expo-sqlite/kv-store`.
- `languages.ts`: the supported list, each with its code, its `Intl` locale (`en-US`, `pt-BR`) and its name written in itself ("English", "Português (Brasil)").
- `actions.ts`: `setLanguage(code)` — persists, then calls `i18n.changeLanguage(code)`.
- `hooks.ts`: `useLanguage()` — current code, its `Intl` locale, and the supported list; re-renders on change.
- `jest.setup.js`: the kv-store mock starts with `settings.language = 'en'` and puts it back after `__clear` (which `__tests__/history.test.tsx` calls between tests), so every existing flow test still opens on the tabs, in English. A test that needs the first launch removes the key itself.
- Tests: `setLanguage` persists and updates `i18n.language`; `readLanguage` returns `null` with nothing stored.

### 4. Take the English out of `src/domain/`
Done before the string pass, so each screen is touched once:
- `messages.ts`: deleted; its texts move to `errors.<reason>` in the dictionaries, and its callers (`reasonMessage` users in `app/` and `src/features/`) call `t(\`errors.${reason}\`)`.
- `types.ts`: `CATEGORY_LABELS` and `TRACKING_LABELS` removed; their texts move to `labels.category.*` / `labels.tracking.*` (plus `labels.targetMode.*` and `labels.category.custom`). `catalogList.ts`'s `categoryKeyLabel` / `exerciseCount` / `groupByCategory` titles and `historyList.ts`'s range and chart labels take `t` (or return keys) instead of building English.
- `format.ts`: `formatDuration` and `formatExerciseList` lose their words — the domain keeps the arithmetic (e.g. `durationParts(ms)`: under a minute, or hours + minutes), `src/i18n/format.ts` writes them; `formatWorkoutDate`, `formatShortDate`, `formatDayDate`, `formatMonth` take a `locale` parameter instead of the hardcoded `'en-US'`. `formatFgPct`, `parseCount`, `formatElapsed` are unchanged.
- `defaults.ts`: `defaultWorkoutName` becomes `timeOfDay(date)` (`morning` / `afternoon` / `evening`); `src/features/workout/actions.ts` turns it into the name with `i18n.t` when the empty workout starts.
- Their unit tests updated to match.

### 5. First-launch gate
In `app/_layout.tsx`, after migrations/fonts load and the splash hides: if `readLanguage()` is `null`, render a `LanguagePickerGate` component (in `src/features/settings/`, not a routable screen) inside `GestureHandlerRootView` / `ThemeProvider`, with a title ("Choose your language"), the two languages below it as a vertical list of radio rows, each named in its own language (English selected at first), and a Confirm button; styled per `docs/design.md`. Selecting a language only retitles the picker: the title and the button are read with `i18n.getFixedT(selected)`, so they switch to the selected language ("Escolha seu idioma" / "Confirmar") while nothing is stored yet. Confirm calls `setLanguage`, and the layout then renders the `Stack`. With a stored language, straight to the `Stack` as today.
Flow test (new `__tests__/language.test.tsx`): no stored language → picker, `expectAccessibleControls()`, pick Português → the tabs in Portuguese; a stored language → straight to the tabs.

### 6. Settings screen
`app/settings.tsx`: the "No settings yet" `EmptyState` is removed (there is now a real setting); a "Language" section with a `ChipRow` of the two languages (`radio` role, the current one selected), the app version kept at the bottom. Selecting a chip calls `setLanguage`, and the screen, plus every mounted one, updates at once.
Flow test: switch to Português in Settings → Settings and the Profile tab behind it show Portuguese text; back to English.

### 7. String extraction pass
Replace every user-facing string with `t('key')`, one folder at a time: `src/components/` (shared, first) → `src/features/workout/` → `routines/` → `history/` → `exercises/` → `profile/` (`displayName`'s "Player") → `tacticalBoard/` → `app/` (screen titles, the tab labels and their `tabBarAccessibilityLabel` in `app/(tabs)/_layout.tsx`, `TabBar`). Each pass covers the visible text **and** the `accessibilityLabel`s, accessibility action labels, `Alert.alert` titles/messages/buttons, placeholders and `ActionSheet` options. Dates get their locale from `useLanguage()`. The existing tests keep passing in English after each folder. Mechanical but the longest step.

### 8. Full CI list, locally
`npm run lint`, `format:check`, `typecheck`, `test`, `npm run db:generate` (expect no diff — no schema change), `npx expo-doctor`. Plus a search for leftover English: no string literal in a JSX text position or a label prop outside the dictionaries.

### 9. Docs
Update the Mapa do Projeto in `CLAUDE.md` and `docs/ARCHITECTURE.md` with `src/i18n/` and `src/features/settings/`; the working convention per the decision above; the kv-store note (two files import it now); the `src/domain/` description (no more `messages.ts`, labels or words in `format.ts`); `settings.tsx`'s description (no longer an empty state); mark this phase's status in `CLAUDE.md`'s "Current status" list.

### 10. Phase commit
One commit, "Phase 9.5: language", following the Working conventions (fix-ups only if CI or the build fails).

### 11. On-phone check
Fresh install shows the picker before anything else; choosing a language shows the whole app in it (tabs, every screen, alerts, dates, the History months, the chart's dates); switching in Settings updates every visible screen without a restart; closing and reopening the app opens directly in the chosen language, with no flash of English; an empty workout started in Portuguese gets a Portuguese name.

## Final checklist (Part A)

- [x] The app opens in the stored language; the first-launch picker appears only when none is stored; the Settings switch changes every screen immediately.
- [x] `src/domain/` has no i18n imports and no user-facing English text (`messages.ts` gone, no `*_LABELS`, no words in `format.ts` / `defaults.ts`).
- [x] Dictionary keys typed (`typecheck` fails on a wrong or missing key), and `en` / `pt-BR` key parity enforced by a test.
- [x] Accessibility labels and alerts translated, not only visible text.
- [x] `npm run lint`, `format:check`, `typecheck`, `test` pass locally, and `db:generate` leaves the migrations unchanged.
- [x] `npx expo-doctor` clean after the new dependencies.
- [ ] CI green on `main`.
- [ ] On-phone check passed (first launch + Settings switch, both languages).

# Part B — Light theme

Today the app is dark only (`docs/design.md`, rule 1). Part B adds a light theme and a theme setting next to the language in Settings. It starts after Part A's on-phone check and commit, and after Phase 9.6's code (already done), so the color pass below also covers 9.6's files.

## Decisions for Part B

| Topic | Decision |
|---|---|
| Options | **System / Light / Dark**, in Settings only. **Dark by default**, so the phone's current install and every existing user see no change; no first-launch prompt for the theme (only the language has one) |
| Light palette | started from `design.md`'s five "Light mode (future reference)" colors and completed for every token (table in step B1). `#E54B72` gives only 3.5:1 as text on the light background, so `primary` becomes the darker `#C2335A` (≥ 4.7:1). `colors.test.ts` checks both palettes; the developer approves it on the phone |
| Tactical board | **the same in both themes**: the court is a picture, not an app surface. New tokens `boardMark` (X marks and arrows, today `textPrimary`), `boardMarkOutline` (today `backgroundDeep`) and `boardPen` (today `primary`) hold today's values in both palettes, as do `court*`, `boardHalo` and `boardBadge`; otherwise the light `textPrimary` / `primary` would lose 3:1 on the green |
| Live switching | an `AppThemeProvider` React context resolves the preference into `{ scheme, colors }`. Styles move from module-level `StyleSheet.create` to `makeStyles((colors) => ({ … }))`, a hook that builds each stylesheet **once per palette** (cached), so a switch doesn't rebuild styles on every render. No `dataStore` involvement: the preference isn't DB data, and tying it to the data version would re-render the root on every write |
| Persistence | `src/features/settings/themeStorage.ts`, key `settings.theme` in `expo-sqlite/kv-store` (the third file allowed to import it, after `profileStorage.ts` and `languageStorage.ts`); missing or invalid → `dark`. No schema change, no migration |
| System mode | follows the phone through React Native's `useColorScheme()`; needs `app.json` `userInterfaceStyle: "automatic"` (today `"dark"`). That is native config: Expo Go picks it up, the APK needs a new build |
| Native pieces | `Appearance.setColorScheme(pref === 'system' ? 'unspecified' : pref)` so native `Alert`s follow the choice; `SystemUI.setBackgroundColorAsync(colors.background)` (`expo-system-ui`, already installed) so no wrong color flashes behind screens; `StatusBar` style follows the scheme. The splash stays dark: it shows before the preference is read |
| Rule changes | `design.md` rule 1 becomes "Dark by default; Light or System can be picked in Settings". Rule 6 (no loose values) gains: a screen never imports a palette, only `useColors()` / `makeStyles` |

## Out of scope for Part B (left for later / backlog)

- `design.md`'s accent `#D9A05B`: no token uses it.
- A light splash screen and light app icon variants.
- Per-element color choices on the tactical board.

## Tools for Part B

None: no new dependency (`expo-system-ui` and the kv-store are already in the project).

## Steps

Each step lands with its own tests; the full suite stays green between steps.

### B1. Light palette and tokens (`src/theme/colors.ts`)
- `export const colors` is split into `darkColors` (today's values) and `lightColors`, both typed `Palette = Record<ColorToken, string>`, so a missing token fails `typecheck`.
- Add `boardMark`, `boardMarkOutline` and `boardPen` (same values in both palettes).
- The light palette (contrast computed with `colors.test.ts`'s formula; every text pair ≥ 4.5:1):

  | Token | Light | Note |
  |---|---|---|
  | `background` | `#F5F6F8` | design.md |
  | `backgroundDeep` / `surface` | `#FFFFFF` | the bars are white, set apart by `divider` |
  | `surfaceRaised` | `#EEF0F3` | |
  | `divider` / `outline` | `#E2E4E9` / `#D3D6DD` | |
  | `outlineStrong` | `#868995` | 3.5:1, non-text |
  | `textPrimary` | `#1E1E24` | design.md, ≥ 14.5:1 |
  | `textSecondary` / `neutralStat` | `#5A5D69` | ≥ 5.7:1 |
  | `iconMuted` / `iconPlaceholder` | `#50535E` / `#8A8C96` | |
  | `primary` / `onPrimary` | `#C2335A` / `#FFFFFF` | ≥ 4.7:1 / 5.4:1 |
  | `primaryContainer` | `#FDEEF2` | `primary` on it: 4.8:1 |
  | `secondary` / `onSecondary` | `#D2EADC` / `#14331F` | light green chip and active tab, 10.9:1 |
  | `secondaryOutline` / `secondaryText` | `#3F7A5A` / `#2A6646` | ≥ 5.0:1 |
  | `success` / `error` | `#1B7342` / `#B83A2A` | ≥ 5.0:1 |
  | `court*`, `board*` | as in dark | the court is the same picture in both themes |
  | `scrim` | `rgba(0, 0, 0, 0.4)` | |

- `colors.test.ts`: the same pairs run for both palettes (`describe.each([['dark', darkColors], ['light', lightColors]])`); the board pairs use `boardMark`, `boardPen` and `courtLine` on the court tokens.

### B2. Theme infrastructure (`src/theme/`)
- `scheme.ts` (pure, tested): `ThemePreference = 'system' | 'light' | 'dark'`, `THEME_PREFERENCES`, `DEFAULT_THEME_PREFERENCE = 'dark'`, `isThemePreference`, and `resolveScheme(preference, systemScheme): 'light' | 'dark'` (a `null` system scheme falls back to `dark`).
- `ThemeContext.tsx`: `AppThemeProvider` (takes the preference, reads the system scheme with `useColorScheme()`, resolves it, provides `{ scheme, colors }`), `useTheme()` and `useColors()`.
- `makeStyles.ts` (tested): `makeStyles((colors) => styles)` returns a `useStyles()` hook; `StyleSheet.create` runs once per palette, cached in a `WeakMap` keyed by the palette object.
- `navigationTheme.ts`: the constant becomes `navigationThemeFor(scheme, colors)`, built on expo-router's `DarkTheme` or `DefaultTheme`.

### B3. Persist the preference (`src/features/settings/`)
- `themeStorage.ts`: `readThemePreference()` / `writeThemePreference(preference)`; missing or invalid → `'dark'`. The kv-store mock in `jest.setup.js` already takes any key; with no `settings.theme` stored, every existing flow test stays dark.
- `themePreference.ts`: a small store over `useSyncExternalStore` (`useThemePreference()`), seeded from `readThemePreference()`.
- `actions.ts`: `setThemePreference(preference)` writes, then notifies the store (every write through an `actions.ts`, as for `setLanguage`).
- `hooks.ts`: re-exports `useThemePreference` next to `useLanguage`.
- Tests: default with nothing stored, an invalid stored value, write → read, `setThemePreference` notifies subscribers.

### B4. Wire the root
- `app/_layout.tsx`: `RootLayout` becomes `<AppThemeProvider preference={useThemePreference()}><RootContent /></AppThemeProvider>`, so the database error screen and the `LanguagePickerGate` follow the theme too. Inside: expo-router's `ThemeProvider` gets `navigationThemeFor(...)`; the `Stack`'s `contentStyle`, the `StatusBar` style (`scheme === 'dark' ? 'light' : 'dark'`); an effect calls `Appearance.setColorScheme(...)` and `SystemUI.setBackgroundColorAsync(colors.background)` on every change.
- `app/(tabs)/_layout.tsx`: `sceneStyle` from the theme.
- `app.json`: `userInterfaceStyle: "automatic"`.
- `jest.setup.js`: mock `Appearance.setColorScheme` if the `jest-expo/android` preset lacks it.

### B5. Color migration pass
The same pattern in every file that imports `colors` (44 today, 57 stylesheets):

```ts
// before
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface } });
// after
const useStyles = makeStyles((colors) => ({ card: { backgroundColor: colors.surface } }));
// in the component
const styles = useStyles();
const colors = useColors(); // only where a color goes in a prop: Icon color, placeholderTextColor, SVG fill
```

- Module-level maps become functions of the palette: `AppText`'s `tones`, `Button`'s `variants`. `fgTone` is unchanged (it returns a tone name, not a color).
- Helpers outside components (the drawing functions in `CourtBoard.tsx`) take `colors` as a parameter and use the `board*` tokens.
- In batches, `typecheck` + `test` after each: `src/components/` (about 20 files, everything else builds on them) → `src/features/` (about 20, `LanguagePickerGate` included) → `app/`.
- Last, remove any fixed `colors` export: `typecheck` then points at every use left. No screen imports a palette.

### B6. Settings screen
`app/settings.tsx` gets an "Appearance" section above "Language": the same section header style and a `ChipRow` (`radio` role, check icon on the selected chip, as the language) with System / Light / Dark, and a caption "System follows your phone's setting." Selecting a chip calls `setThemePreference`; the whole app, Settings included, changes color at once. New keys `settings.appearance`, `settings.theme.system` / `light` / `dark`, `settings.themeHint` in `en.ts` **and** `pt-BR.ts` (the parity test and `typecheck` enforce both).

### B7. Tests
- Unit: `scheme.test.ts`, `makeStyles.test.ts` (same object for the same palette, another for the other palette), `themeStorage.test.ts`, the theme part of `actions.test.ts`, `colors.test.ts` on both palettes.
- New flow test `__tests__/theme.test.tsx` (real root layout, `renderRouter`): Profile → Settings shows Dark selected; Light → the chip is selected, the screen's background is `lightColors.background`, `settings.theme` is stored as `'light'`; render the app again → still Light; System with `useColorScheme` mocked to `light` / `dark` follows it; the same flow in Portuguese shows the translated labels; `expectAccessibleControls()` on every screen visited.

### B8. Visual review in Expo Go (light theme)
Walk every screen in Light and fix what shows up: the three tabs (Workout's routine chips and FAB, Exercises' category cards, Profile's card, stats and chart grid), the active workout (set rows, timer, swipe-to-delete, `ResumeBanner`), the template editor, the modals (picker, Add to Routine, `ActionSheet`, `NameDialog`, `TargetModeSheet`), History and a session, the exercise detail and form, Edit Profile and the `Avatar`, the tactical board (editor and thumbnail), the `LanguagePickerGate` and the native `Alert`s. Watch for shadows / `elevation` on white, media placeholders, the active tab's pill, System following the Android quick toggle with the app open, and whether `Appearance.setColorScheme` recreates the Activity (if it does, drop that call and let `Alert`s follow the phone). Fixes go into the palette, never into a screen.

### B9. Full CI list, locally, and docs
- `npm run lint`, `format:check`, `typecheck`, `test`, `npm run db:generate` (no diff), `npx expo-doctor`.
- `docs/design.md`: rules 1 and 6 per the decisions; "Light mode (future reference)" becomes the real light palette table.
- `CLAUDE.md`: "Dark only" → dark by default with Light/System in Settings; styling through `makeStyles` / `useColors`; the kv-store's third reader (`themeStorage.ts`); the new files in `src/theme/` and `src/features/settings/`; the Mapa do Projeto; this part's status.
- `docs/ARCHITECTURE.md`: the same files; `/settings` with the Appearance section; `theme` in the flow tests list.

### B10. Commit and on-phone check
- One commit, "Phase 9.5: light theme" (Part A keeps its own "Phase 9.5: language"), fix-ups only if CI or the build fails.
- On the phone (Expo Go): Dark → Light → System switch live; closing and reopening keeps the choice with no flash of the other theme; System follows the phone's quick toggle; the B8 list reads well in Light. On the next `preview` APK: System works (`userInterfaceStyle`), and updating over the installed APK keeps Dark as the default.

## Final checklist (Part B)

- [x] Settings switches between System / Light / Dark at once; the choice persists; Dark is the default.
- [x] `colors.test.ts` passes for both palettes; no screen imports a palette (`makeStyles` / `useColors` only).
- [x] The tactical board looks the same in both themes (same tokens; to confirm on the phone in B8).
- [x] Theme labels in both dictionaries; `expectAccessibleControls()` in the new flow test.
- [x] `npm run lint`, `format:check`, `typecheck`, `test` pass locally; `db:generate` leaves the migrations unchanged. `npx expo-doctor` flags only Expo patch-version mismatches (expo, expo-asset, expo-constants, expo-linking, expo-router, expo-sqlite) that were already there; `npx expo install --fix` to clear.
- [ ] CI green on `main`.
- [ ] On-phone check passed (every screen in Light, the three modes, System following the phone).
