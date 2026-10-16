# Basket Routine

An Android app for planning and logging basketball training. You build routines out of workout templates, run a workout set by set, and track **makes / attempts** with automatic **FG%**, so you can see your shooting improve over time.

I built it for my own training.

<!-- Add screenshots here, e.g.:
<p align="center">
  <img src="docs/screenshots/workout.png" width="220">
  <img src="docs/screenshots/active-workout.png" width="220">
  <img src="docs/screenshots/profile.png" width="220">
</p>
-->

## Features

- **Routines → workouts → sessions.** Group workout templates into routines, start one (or an empty workout) and log each set. An unfinished workout can be resumed later.
- **Shooting stats.** Sets track makes and attempts, or a simple check. FG% is computed per set, per exercise and per session, and colored by range (above 60%, 40–60%, below 40%).
- **Exercise catalog.** 44 built-in drills in 5 categories (shooting, finishing, ball handling, dribbling, footwork), some with demo videos. You can also create custom exercises with your own photo or video.
- **History and progress.** Full history by month, a session detail view, per-exercise stats and an FG% evolution chart on the profile.
- **Tactical board.** Draw plays on a half court and attach them to an exercise.
- **Polish.** Drag-to-reorder, swipe-to-delete, haptics, dark/light theme, and English and Brazilian Portuguese.
- **Offline-first.** All data lives in a local SQLite database on the phone. No account, no server.

## Tech stack

TypeScript · React Native 0.86 · Expo (Router, SQLite, Video) · Drizzle ORM · i18next · React Native SVG · Reanimated · Jest · GitHub Actions · EAS Build

## Architecture

```text
app/              # screens and navigation (Expo Router, file-based)
src/
├── domain/       # pure business rules: FG%, summaries, validation, tactical board model
├── db/           # SQLite schema, migrations, seed data and repositories (Drizzle)
├── features/     # one folder per feature: actions (writes), hooks (reads), components
├── components/   # shared UI components
├── i18n/         # English and Portuguese translations
└── theme/        # design tokens (colors, spacing, typography)
```

- **Layered design:** screens never touch the database directly. They call feature actions, which use the repositories, which apply the rules in `domain/`. The domain layer has no database or UI code, so it is easy to test.
- **Tested:** about 70 test files cover the domain rules, the repositories (run against an in-memory SQLite with the real migrations), components and full flows.
- **CI:** every push runs lint, Prettier, type checking, the tests, a check that the schema and migrations are in sync, and `expo-doctor`. A manual workflow then builds the APK on EAS.
- **Accessible:** touch targets of at least 48 dp, text contrast of at least 4.5:1 (checked in tests), and labels on every control.

The design rules, colors and component patterns are in [docs/design.md](docs/design.md).

## Development

Requires Node 24 (pinned in `.nvmrc`).

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on an Android phone on the same Wi-Fi network (add `--tunnel` if the network blocks it).

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run lint`         | ESLint                                           |
| `npm run format`       | Format the project with Prettier                 |
| `npm run format:check` | Check formatting without writing                 |
| `npm run typecheck`    | TypeScript, no emit                              |
| `npm test`             | Run the test suite                               |
| `npm run db:generate`  | Generate a SQL migration from `src/db/schema.ts` |

## Building an APK

The APK is built with EAS Build and installed manually (no Play Store).

- **From GitHub:** run the "Build APK" workflow (Actions tab → Run workflow). It runs CI first, then queues a build on EAS.
- **From the terminal:** `npx eas-cli@latest build -p android --profile preview`.

When the build finishes, open its page on the [EAS dashboard](https://expo.dev), scan the QR code on the phone, then download and install the APK. Installing over an existing build updates the app without losing data, as long as it is signed with the same key.
