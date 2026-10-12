# Phase 9.6 — Workout tab layout

Detailed plan for Phase 9.6 of [PLAN.md](PLAN.md), inserted between Phase 9.5 (Language) and Phase 10 (Testing & Release) after the developer asked for a calmer Workout tab once Phase 9.5's code was done.

**Goal:** the Workout tab puts the workouts and their exercises first. Creating a routine is rare, so it gets a small `+` in the header; the routines become a row of chips (a carousel) that switches which routine's workouts show; Quick Start becomes a floating button above the tab bar.

**Done when:** the new tab works on the phone in English and Brazilian Portuguese, the full CI list passes, and CI is green on the phase commit.

## Decisions for this phase

| Topic | Decision |
|---|---|
| New Routine | an outlined `+` `IconButton` in the `Screen` header (the same one the Exercises tab uses for New Exercise), shown only when at least one routine exists; with none, the `EmptyState` keeps its own New Routine button |
| Carousel | a `ChipRow` (horizontal, `radio` role, check on the selected chip) with one chip per routine; the selected routine's section shows below it |
| Selection | always the first routine when the tab opens, nothing stored. Kept as the selected id in state; a deleted or unknown id falls back to the first routine; a routine just created becomes the selected one |
| Routine actions | the selected routine's name with its ⋮ menu (Rename, Move left, Move right, Delete) in the section below the chips |
| Reordering routines | through the menu only (Move left / Move right); the vertical drag and `DraggableRoutineList` are removed. Workouts and a template's exercises keep their Move up/down and their drag |
| Workout cards | list every exercise of the workout (no "+N more", no line limit) |
| Quick Start | the existing extended `Fab` ("Start Empty Workout"), only when no session is in progress: `ResumeBanner` already resumes one on every tab |
| Schema | no change, no migration |

## Out of scope

- Remembering the selected routine across launches.
- Dragging a chip to reorder routines.
- Changing Add to Routine's list or History rows (they keep the short "+N more" exercise list).

## Steps

### 1. Docs
This file, and the Phase 9.6 entry in `PLAN.md`.

### 2. Dictionaries
`common.moveLeft` / `common.moveRight` in both dictionaries; drop `routines.quickStart`, `routines.routinesHeading` and `routines.resumeWorkout` once unused.

### 3. `RoutineSection`
Remove the drag gesture and its props; the menu offers Move left / Move right (`arrow_back` / `arrow_forward`). Delete `DraggableRoutineList.tsx`.

### 4. `WorkoutCard`
Show the full exercise list (`formatExerciseList` with `max` = the number of exercises, no `numberOfLines`).

### 5. `app/(tabs)/index.tsx`
Chips, selection, header `+`, the section in a vertical scroll with `FAB_CLEARANCE` at the bottom, the `Fab` when there is no session.

### 6. Tests
`shell`, `language`, `routines`, `active-workout`, `exercises`: the Quick Start card and the tab's "Resume Workout" button are gone (the banner resumes); the routine name shows in a chip and in the section; a new test covers switching routines and selecting the one just created.

### 7. Docs again
`docs/design.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`.

## Phone check

- No routine: the `EmptyState` and the FAB, no `+` in the header.
- Create three routines through the `+`: the new one is selected.
- Switch routines with the chips; Rename / Move left / Move right / Delete from the ⋮.
- A workout with five or more exercises lists them all.
- The FAB starts an empty workout and is hidden while the "Workout in progress" banner shows.
- **Gestures:** the chip row is a horizontal scroll inside the tabs' native pager. Dragging the row must scroll the chips, dragging elsewhere must change the tab. Fallbacks, in order: gesture-handler's `ScrollView` in `ChipRow`, or `ChipRow` in `wrap` mode.
- A long routine name: check whether the chip needs `numberOfLines={1}`.
- Repeat in Brazilian Portuguese.
