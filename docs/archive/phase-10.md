# Phase 10 — Testing & Release (direction only)

**Status: postponed, and deliberately not detailed.** More changes to the app are planned before v1.0, and they will change the screens and flows this phase tests. A detailed plan written now would be out of date by the time it's used. This file only records what the phase is for. **Rewrite it in full (in the level of detail of `phase-0.md`) once the app changes are done**, and only then start it.

A first detailed draft was written and reviewed on 2026-10-12, then dropped; its reusable ideas and the review's findings are in "Things to remember" below.

## Goal

Close v1.0: confirm the main flow works end to end on a real phone, confirm the app stays fast with a long history, and publish the v1.0 APK over the one already installed, keeping its data.

## What the phase has to cover

1. **End-to-end tests of the main flow on the phone**, run against a separate test install (its own application ID, so the real data is never touched). Main flow: routine → workout template → start → log → Finish → summary → History. Plus the cases only a real device shows: killing and relaunching the app with a workout in progress, and an invalid value rolling back.
2. **A performance check** with a long history and a long workout, measured against budgets written down before measuring. Fix only what misses its budget.
3. **The v1.0 release**: an APK built from a tagged commit, installed over the previous APK without uninstalling, checked on the phone (icon, splash, fonts, gallery media, haptics), then used in a real training session. Feedback from that session becomes `v1.0.1` fixes or `docs/backlog.md` entries.

## Done when

- The main flow's E2E tests pass on the phone, repeatedly, against the test install, and the real app's data is untouched.
- The performance budgets are met on the test install with the long data.
- All CI checks pass and CI is green on the phase commit.
- The v1.0 APK is installed over the previous one, the old data is still there, and it has been used in a real training session.

## Things to remember when rewriting this

From the draft and its review. None of this is decided; it's what not to forget.

- **Data upgrade is the biggest risk.** The APK on the phone may be older than several migrations (the Phase 5 APK only has `0000`). The v1.0 install will be the first time those migrations run on the real data, there's no backup or export, and a release APK doesn't allow `run-as`. Decide beforehand how to test that upgrade with data (a Jest test chaining all migrations over inserted data, and/or an E2E install of the old version upgraded in place) and what to do if it fails. Re-check which migrations exist by then.
- **E2E tool and safety**: Maestro was the choice (YAML flows, drives an installed APK through `adb`, no change to the build). The test install should be an app variant with another package ID (`APP_VARIANT` in an `app.config.ts`, an `e2e` EAS profile), and a Jest test should guard that no flow can ever name the real package or scheme, since `clearState` wipes the app it names. Tools needed (JDK, `adb`, Maestro) are installed only with approval.
- **Every flow starts on a clean install**, so it meets whatever the app shows on first launch (today the language picker, which a release build shows when no language is stored). Check the first-launch screens at the time.
- **Selectors**: text and accessibility labels first; `testID`s only where a label repeats (cells per exercise card, a "Discard" in both the banner and its confirmation dialog). Confirm them with `maestro hierarchy` in Expo Go before spending an EAS build. Beware Maestro's `hideKeyboard` on Android and asserting short numbers that match other text.
- **Performance data**: a deterministic generator (seeded PRNG) loaded on the phone through a dev-tools screen that exists only in the test variant, inside one outer transaction (nested repository transactions are savepoints, verified in Drizzle's expo-sqlite driver). Budgets need a named target phone and a baseline with an empty database. Profile before fixing; an index is the one schema change worth allowing.
- **Release mechanics**: tag the phase commit `v1.0.0` and run the "Build APK" workflow from that tag (it builds the ref it runs on); `version` in `app.json` and the remote `versionCode` already handle numbering; never uninstall the previous APK.
- **Order**: check the pending on-phone work first (Phases 9, 9.5 and 9.6), so the tests aren't written against UI that is about to change.
- **Out of scope** unless decided otherwise: E2E in CI, a `production` profile or Play Store, backup/export, anything in `docs/backlog.md`.
