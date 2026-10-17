# Design guide

The look of Basket Routine: its rules, tokens and patterns. It comes from the developer's design handoff for Phase 8 (a `DESIGN.md`, a `tokens.json` and eight HTML mockups, removed from the repo once built). The values live in code in `src/theme/`, and the built screens are the reference for anything this guide doesn't spell out. A new screen follows the patterns of the existing ones.

Units: 1 px of the mockups = 1 dp; reference width 390 dp. Screens scroll; the tab bar and the bottom action bars stay fixed.

## Rules

1. **Dark by default; Light or System can be picked in Settings.** Two palettes with the same tokens (`darkColors`, `lightColors`); the tactical board looks the same in both.
2. **Touch targets ≥ 48 dp** on everything pressable (icon buttons, chips, check boxes, list rows).
3. **Text contrast ≥ 4.5:1.** Only the token pairs below, checked in `src/theme/colors.test.ts`; no new colors.
4. **Color is never the only signal:** a selected chip has a check icon; an FG% always shows its number.
5. **Accessibility:** an icon-only button has an accessibility label; every control has a role and a name (`expectAccessibleControls` in the flow tests).
6. **No loose values in screens:** every color, size, spacing, radius and font comes from `src/theme/`. A screen never imports a palette: colors come from `useColors()` or `makeStyles((colors) => ...)`.
7. **Main actions within the thumb's reach:** at the bottom of the screen (bottom action bar or FAB).
8. UI texts in English. Uppercase is a `textTransform`, never the text itself.

## Colors (`src/theme/colors.ts`)

| Token | Value | Use |
|---|---|---|
| `background` | `#1E1E24` | Screen background |
| `backgroundDeep` | `#121215` | Tab bar and fixed bottom action bars |
| `surface` | `#282830` | Cards, unselected chips, text fields |
| `surfaceRaised` | `#32323C` | Items and fields inside cards |
| `divider` | `#2E2E36` | Top border of the fixed bars |
| `outline` | `#3A3A44` | Unselected chip border, dividers inside cards, chart grid |
| `outlineStrong` | `#7A7C88` | An empty check box's border (3:1 on `surface`) |
| `textPrimary` | `#F5F6F8` | Text |
| `textSecondary` | `#B4B6C0` | Captions, labels, placeholders (≥ 7:1) |
| `iconMuted` | `#C4C6D0` | ⋮ menus, chevrons, trash |
| `iconPlaceholder` | `#8A8C96` | The ball in media placeholders and empty states |
| `primary` | `#F47C98` | Main actions (Start Empty Workout, Finish Workout, Save, Save Exercise, Done, Add to Routine, the FAB, Add Set), the chart line |
| `onPrimary` | `#1E1E24` | Text and icons on `primary` (≈ 6.5:1) |
| `primaryContainer` | `#3A2830` | Behind the round play button (icon in `primary`) |
| `secondary` | `#2B5840` | Selected chips, the active tab's pill, a done check box, the timer |
| `onSecondary` | `#F5F6F8` | Text and icons on `secondary` (≈ 7.5:1) |
| `secondaryOutline` | `#4E8F6B` | Green outlines: the logged number field, New Workout (dashed), Choose media, selected chips; the routine carousel's current dot |
| `secondaryText` | `#A8D5BA` | Green text: the active tab's label, New Workout, the Custom tag, "Workout in progress" |
| `success` | `#7FD1A0` | FG% above 60%, a done check in history |
| `error` | `#FF9580` | FG% below 40%, Discard Workout, destructive options, validation messages |
| `neutralStat` | `#C4C6D0` | FG% from 40 to 60% |
| `court` | `#2B5840` | The tactical board's floor |
| `courtFrame` | `#3E7258` | The thumbnail's 1 dp outline |
| `courtPaint` | `#24503A` | The paint (lane) |
| `courtArc` | `#2D5B44` | The three-point area (3:1 under a pink stroke) |
| `courtLine` | `#A8D5BA` | The court's lines |
| `boardHalo` | `rgba(16,36,26,0.85)` | Under every mark on the board, wider than it |
| `boardBadge` | `rgba(18,18,21,0.7)` | Behind the thumbnail's expand icon |
| `scrim` | `rgba(0,0,0,0.6)` | Behind dialogs and action sheets (not a text color) |

Pressed and disabled states have no colors of their own: `opacity.pressed` (0.8) and `opacity.disabled` (0.4).

### FG% colors

| FG% | Token |
|---|---|
| above 60% | `success` |
| 40% to 60% (both included) | `neutralStat` |
| below 40% | `error` |
| no value (`—`) | `textSecondary` |

The band is computed on the percent rounded in tenths, the number shown (`fgBand` in `src/domain/fg.ts`, `fgTone` in `src/components/fgTone.ts`). Only the number is colored, never the row, and it is always written. Every FG% on screen follows it (set rows, totals, summary, history, chart value, stats).

### Light mode

Picked in Settings (System / Light / Dark; Dark is the default). `lightColors` has the same tokens as the dark palette, with the same contrast rule (≥ 4.5:1 text), checked for both palettes in `colors.test.ts`. The tactical board (`court*`, `board*`) keeps the dark values in both: the court is a picture, not an app surface.

| Token | Light | Note |
|---|---|---|
| `background` | `#F5F6F8` | |
| `backgroundDeep` / `surface` | `#FFFFFF` | the bars are white, set apart by `divider` |
| `surfaceRaised` | `#EEF0F3` | |
| `divider` / `outline` | `#E2E4E9` / `#D3D6DD` | |
| `outlineStrong` | `#868995` | 3.5:1, non-text |
| `textPrimary` | `#1E1E24` | |
| `textSecondary` / `neutralStat` | `#5A5D69` | |
| `iconMuted` / `iconPlaceholder` | `#50535E` / `#8A8C96` | |
| `primary` / `onPrimary` | `#C2335A` / `#FFFFFF` | `#E54B72` gave only 3.5:1 as text |
| `primaryContainer` | `#FDEEF2` | |
| `secondary` / `onSecondary` | `#D2EADC` / `#14331F` | light green chip and active tab |
| `secondaryOutline` / `secondaryText` | `#3F7A5A` / `#2A6646` | |
| `success` / `error` | `#1B7342` / `#B83A2A` | |
| `scrim` | `rgba(0, 0, 0, 0.4)` | |

The accent `#D9A05B` from the original inspiration has no token.

## Typography (`src/theme/typography.ts`, `src/theme/fonts.ts`)

**Plus Jakarta Sans**, weights 400 / 600 / 700 / 800, bundled in `assets/fonts/` (SIL Open Font License). Each weight is its own `fontFamily` (Android doesn't pick a file from `fontWeight`); `AppText`'s `weight` prop overrides a variant's. Numbers in stats, tables and the timer use tabular figures (`tabularNums`).

| Variant | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 32 / 40, −0.5 | 800 | Tab screen titles (Workout, Exercises, Profile), the summary's |
| `titleLarge` | 28 / 36, −0.4 | 800 | Detail screen titles |
| `title` | 26 / 32, −0.4 | 800 | The active workout's, the forms' and modals' titles |
| `headline` | 22 / 28 | 800 | "Routines", History row FG%, stats tiles, the logged number field |
| `stat` | 34 / 42, −0.5 | 800 | Big numbers (50.7%, 1 / 1) |
| `statMedium` | 30 / 38, −0.5 | 800 | The latest FG% on the chart card |
| `cardTitle` | 18 / 24 | 700 | An exercise's or workout's name on a card |
| `sectionTitle` | 17 / 24 | 700 | Card titles (Shooting…), list row titles, the target number field |
| `body` | 16 / 24 | 400 | Text |
| `bodySmall` | 15 / 22 | 400 | Secondary lines, totals, chips (600, 700 when selected), FG% in tables (700) |
| `subtitle` | 14 / 20 | 400 | List row subtitles; field labels (700) |
| `sectionHeader` | 14 / 20, +0.3 | 700 | A list's section headers (a category, a month) |
| `caption` | 13 / 18 | 400 | Card subtitles ("Fixed attempts · log makes") |
| `label` | 12 / 16, +0.8, uppercase | 700 | Table headers (SET, MAKES…), tab labels, stats tile labels |
| `micro` | 11 / 14 | 400 | The chart's axis and date labels |
| `button` | 16 / 20, +0.3 | 800 | Primary buttons, the FAB |
| `buttonCaps` | 14 / 20, +1, uppercase | 800 | The Workout tab's primary button |
| `buttonCompact` | 13 / 18, +0.8, uppercase | 700 | New Workout |

## Spacing, radius and sizes (`src/theme/spacing.ts`)

- **Spacing:** screen padding 16, section gap 16, card padding 20 (compact 16), item gap 12, chip gap 8; the scale in between: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32.
- **Radius:** card 20, button 16 (also items inside cards), input 14 (also thumbnails and stats tiles), cell 12 (number fields, note field), chip 24, FAB 18, pill 999; the tactical board: court 24, its thumbnail 14, a toolbar button 18, the expand badge 10.
- **Sizes:** min touch target 48, primary button 56, input 52, chip 48, icon button 48, play button 52, check box 52, list thumbnail 64, tab bar 88 (+ bottom inset), icon 22 (small 18, button glyph 20, large 24).
- **Tactical board:** a toolbar button (5 tools, Undo, Clear) 48, the curve handle 0.5 m on the court, the expand badge 32; strokes in dp (`boardStroke`): court lines 1.6, marks 3.5 over a 7 halo, thinner on the thumbnail (1.1, 2.6, 6.1).
- **Borders:** hairline 1 (dividers, fixed bars' top edge), outline 1.5 (chips, fields, outlined buttons, check boxes).
- **Elevation:** only the FAB, `0 6 18 rgba(0,0,0,0.45)`.

## Icons

Material Symbols through `Icon` (the only `expo-symbols` import), always with a color: `sports_basketball`, `format_list_bulleted`, `history`, `person`, `more_vert`, `play_arrow`, `add`, `check`, `timer`, `arrow_back`, `close`, `keyboard_arrow_down`, `delete`, `search`, `chevron_right`, `lock`, `photo_library`, `playlist_add`, `edit`, `arrow_upward`, `arrow_downward`, `arrow_back`, `arrow_forward`, and for the tactical board `assignment_add`, `pan_tool`, `arrow_outward`, `ink_eraser`, `undo`, `open_in_full`, `layers_clear`.

## Patterns

- **Screen header (`Screen`):** optional 48 dp button before the title (back, close, minimize) and an optional slot after it (⋮, trash, timer); the title's first line sits level with those buttons, a subtitle in `bodySmall` / `textSecondary` under it. The title size depends on the screen (see Typography).
- **Tab bar (`TabBar`):** `backgroundDeep`, 88 dp, `divider` top border; the active tab has a 64 × 32 `secondary` pill behind its icon and a `secondaryText` label. Hidden while the keyboard is open. The "Workout in progress" banner sits above it.
- **Bottom action bar (`BottomActionBar`, `Screen`'s `footer`):** `backgroundDeep`, `divider` top border, a full-width `primary` button of 56 dp. Used for the screen's main action (Finish Workout, Save, Save Exercise, Add to Routine). Hidden while the keyboard is open.
- **Extended FAB (`Fab`):** bottom right, above the tab bar, `primary`, 56 dp, radius 18, with the FAB shadow. The list under it gets room at its bottom (`FAB_CLEARANCE`). The Workout tab ("Start Empty Workout", hidden while a workout is in progress: the banner resumes it) and the exercise picker ("New Exercise").
- **Buttons (`Button`):** `primary` (main action), `secondary` (`surface`, e.g. Add Exercise), `ghost` (text in `primary`, e.g. Add Set in the template editor), `ghostCompact` (the same at 40 dp with the hit area padded back to 48 dp, Add Set in the active workout), `danger` (`surface`, text in `error`, e.g. Discard Workout), `tonal` (green pill, no screen uses it now), `dashed` (dashed `secondaryOutline`, New Workout), `outline` (`secondaryOutline`, Choose media), `bordered` (48 dp, radius 14, `outline` border, `textPrimary`: a quiet action inside a card, Edit Profile), `text` (48 dp, `textPrimary` text only: a header's Cancel), `primaryCompact` (48 dp, radius 14, `primary`: a header's Save, disabled on an empty tactical board).
- **Cards (`Card`):** `surface`, radius 20, padding 20 (16 compact); items inside a card are `raised` (`surfaceRaised`, radius 16).
- **Chips (`ChipRow`):** 48 dp, radius 24, 1.5 border. Selected: `secondary`, `secondaryOutline` border, check icon, text 700. Unselected: `surface`, `outline` border, text 600. A filter above a list scrolls sideways edge to edge; chips in a form wrap onto lines.
- **List rows (`ListItem`, `ExerciseRow`):** on the background, 64 dp thumbnail (radius 14, `surface` with the `iconPlaceholder` ball when there is no media), title `sectionTitle`, subtitle `subtitle` / `textSecondary`, chevron `iconMuted`. The Custom tag is `secondaryText`.
- **Text fields (`TextField`):** 52 dp, radius 14, `surface`; a search field has its icon inside; inside a card they are `surfaceRaised`, 48 dp, radius 12.
- **Set table:** columns always **SET · MAKES · ATTEMPTS · FG%** (makes before attempts), on the active workout, the history and every header. The value the user logs is the emphasized field (flexible width, 56 dp, `secondaryOutline` border, `headline`); the fixed target is the plain one (92 dp, 48 dp, `sectionTitle`). Set number column 36 dp, FG% column 56 dp, right-aligned. A check drill's box is 52 dp: `secondary` with a check when done, `surfaceRaised` with an `outlineStrong` border when not. In history, both values share the width evenly and a done check is a `success` check icon.
- **Stats tiles (`StatTile`):** `surfaceRaised`, radius 14, padding 12; label in `label` / `textSecondary`, value in `headline` (`statMedium` on the Profile).
- **Avatar (`Avatar`):** a circle, 80 dp on the Profile card and 120 dp on Edit Profile: the photo cropped to fill, or the name's initial in `display` on `secondary` (a person icon with no name).
- **Timer (`ElapsedTimer`):** a 36 dp `secondary` pill with the timer icon, `mm:ss` (`h:mm:ss` from one hour on), tabular figures.
- **FG% evolution chart (`FgChart`):** a 0 / 50 / 100% grid in `outline`, the line and dots in `primary` (dots with a `surface` ring), the latest dot larger with its value above, dates under the points in `micro`. Drawn with plain views, no chart library.
- **Tactical board (`CourtBoard`, one renderer for the thumbnail, the editor and History):** a FIBA half court (15 × 14 m, the basket at the top, the half-court line and half the center circle at the bottom) on `court`, the paint in `courtPaint`, the three-point area in `courtArc`, lines in `courtLine`, the free-throw circle's half inside the paint dashed. Marks over a `boardHalo`: X marks and arrows in `boardMark`, pen strokes in `boardPen`; fixed colors and widths, the same in both themes. A selected arrow (Hand tool) shows a small square handle at its curve point (`boardMark` with a `boardMarkOutline` stroke, on `boardHalo`), dragged to bend it. On an exercise card's header, between the name and ⋮: an `assignment_add` icon button until there is a board (`Add tactical board for <exercise>`); once saved, the whole court shows as a thumbnail below the header, centered and at most 260 dp wide (`size.boardThumbnailMax`; radius 14, `courtFrame` outline) with a 32 dp `open_in_full` badge at the bottom right, which opens the editor; in History, the thumbnail without the badge, not pressable. A board is never saved empty: Save is disabled until at least one mark is drawn, and removing the last one is only through the card's ⋮ menu.
- **Dialogs and action sheets:** on `scrim`; `surface`, radius 20; sheet rows 56 dp with `iconMuted` icons, destructive ones in `error`.
- **Empty states (`EmptyState`):** the `iconPlaceholder` icon at 48, a `cardTitle`, a `bodySmall` / `textSecondary` message, an optional `secondary` button.

## Screens

| Screen | Key points |
|---|---|
| Workout (tab) | A `+` (outlined `IconButton`) in the header for New Routine, shown once a routine exists; a quiet routine carousel (the first routine on opening): ‹ and › (`iconMuted`, disabled at the ends; a swipe changes the tab, not the routine), the routine's name (`sectionHeader`, `textSecondary`, header role) with its ⋮ (Rename / Move left / Move right / Delete), and under them a 6 dp dot per routine (`secondaryOutline` for the shown one, `outline` for the rest; read as "Routine 2 of 3"); under it, with no card around them, the routine's workouts as compact cards (⋮ and round play, every exercise listed) and New Workout dashed; the Start Empty Workout FAB at the bottom right |
| Active workout | Minimize, `title`, the timer; exercise cards (compact) with the exercise's media in the header (64 dp thumbnail like a list row's, left of the name; holding it floats the media over the `scrim`, playing, in a portrait box with radius 20, until release; a tap floats it with a ✕ on a `surfaceRaised` circle, closed by the ✕, a tap outside or Back), the set table, the total, Add Set, the note; Add Exercise; Discard Workout at the end; Finish Workout in the bottom bar |
| Template editor | Like the active workout, with targets only and the exercise's name a step smaller (`body`, bold); Save in the bottom bar |
| Tactical board editor | Full screen: Cancel (`text`), `title` "Tactical board" with the exercise under it, Save (`primaryCompact`, disabled on an empty board), the header centered against the whole two-line title block (`Screen`'s `centerHeader`); the court as wide as the screen allows with an 8 dp margin (radius 24), centered in the room above the tools; the toolbar at the bottom, in two rows: Undo and Clear (`iconMuted`, disabled with nothing to undo / no marks) in their own small `backgroundDeep` rectangle, right-aligned above; Hand / X / Arrow / Pen / Eraser centered below, in the `backgroundDeep` bar (`divider` top border) that alone spans the screen's width (one selected, filled `primary` with its icon in `onPrimary`) |
| Workout summary | `display` title and date · duration; Shooting, Checks and Exercises cards; Done at the end |
| Exercises (tab) | Search with icon, filter chips scrolling sideways, rows grouped by category, Custom tag, the New Exercise FAB |
| Exercise picker | Like the Exercises tab, with the New Exercise FAB |
| Exercise detail | Back, `titleLarge`, the media (180 dp, radius 20), the description, the lock note for predefined exercises, Your stats, Add to Routine in the bottom bar |
| Exercise form | Close, `title`; fields with 14 / 700 labels; media box (200 dp) with Choose media; category and tracking chips wrapping; Save Exercise in the bottom bar |
| Profile (tab) | Settings (gear, 48 dp) right of the `display` title; the profile card (avatar, name in `headline`, Edit Profile `bordered`); Your stats (Sessions and AVG FG% tiles with the values in `statMedium`; Shots made and Time trained tiles); the FG% evolution card; "History" in `headline` with "See all" (`ghost`, beyond 5 sessions); the last 5 sessions under month headers, each a card with name, date · duration, exercises, and the FG% and checks on the right |
| History | Back, `titleLarge`, "N workouts logged"; every session by month, rows as on the Profile tab |
| Settings | Back, `titleLarge`; an empty state ("No settings yet") until settings are added |
| Edit Profile | Close, `title`; the photo (120 dp avatar) with Choose / Change photo (`outline`) and Remove photo (`danger`); the name field; Save Profile in the bottom bar |
| Session detail | Back and trash (48 dp); Shooting and Checks cards; each exercise read-only, with its tactical board when it had one |

## App icon and splash

The logo (a pink, green and black swirl around a basketball) on its light background `#F5F5F7`, source in `assets/images/source/logo.png`. The adaptive icon's background is `#F5F5F7`, with the logo inside the safe circle; the monochrome icon is the logo's shapes in white; the splash shows the logo on a light disc over `background`.
