# Ntsiniz — Task 0 Foundation Upgrade Notes

This upgrade adds a **modular UI library**, **Component Lab**, **overlay/HUD patterns**, and a **QA/testing foundation** without rewriting the app.

## What changed

### Added: `src/ui/` modular UI library skeleton

- `src/ui/tokens/*` design tokens
- `src/ui/theme/*` lightweight ThemeProvider
- `src/ui/primitives/*` Box/Text/Stack/Pressable/Surface/etc.
- `src/ui/components/kit/*` reusable components (Button/Input/Card/…)
- `src/ui/patterns/*` Ntsiniz-specific overlay patterns (RecordingOverlay, RecorderHUD, PlaybackOverlay, WaveformCard, TakeBadge)
- `src/ui/testing/*` render helper + Node test suite

### Added: dev-only Component Lab

- Screen: `src/app/screens/ComponentLabScreen.tsx`
- Route registered **only in `__DEV__`**: `RootStackParamList.ComponentLab`
- Access: tap **Settings** title **7 times** → QA tools section appears → "Open Component Lab"

### Added: i18n helper (minimal)

- `src/app/i18n/index.ts` provides `t()` used by new UI library and Component Lab.

## How to run

```bash
npm install
npm start
```

## How to run checks

```bash
npm run lint
npm run typecheck
npm test
npm run ci
```

## Notes

- The app is now globally wrapped in the new `ThemeProvider` (tokens + theme available everywhere).
- i18n `t()` now supports simple `{var}` interpolation via `t('path.key', { var: 'value' })`.
- New UI kit components are exported via `src/ui/index.ts` and can be adopted screen-by-screen.
- As part of stability hardening, the Settings screen was updated to use `t()` for user-facing strings and improved accessibility for the hidden dev entry.

## Recommended next migration order

1. Settings/About (low-risk)
2. Welcome
3. Results/Journey
4. Drill/Playback (higher risk due to real-time + waveform)

## Hard migration: React Native primitives → UI primitives

This upgrade additionally performs a repo-wide “hard migration” of common React Native primitives:

- `View` → `Box`
- `Pressable` / `Touchable*` → `Pressable`
- `Text` → `Text`

These are imported from `@/ui` so the entire app uses the new UI system consistently.

Notes:
- Scrollers (`ScrollView`), lists (`FlatList`), `Image`, `TextInput`, and other platform-native components remain from `react-native` intentionally.
- UI primitives live in `src/ui/primitives/*` and wrap React Native so behavior stays identical.


## Additional upgrades (post-hard-migration)

- **Full i18n conversion**: migrated remaining user-facing strings in screens + share cards + charts to `t()`.
- **Locales added**: `src/app/i18n/zu.ts` and `src/app/i18n/xh.ts` (partial overrides) + `setLocale()` now merges overrides onto English.
- **Pack-per-language JSONs**: added `src/content/drills/phase1.zu.json` and `phase1.xh.json` (currently English copies) and updated pack loader to pick `phase1.<locale>.json` with fallback to English.
- **CI guard**: added `npm run check:i18n` and wired it into `npm run ci` to fail builds if new hardcoded `<Text>` nodes are introduced.
- **Primitive patch**: improved `Pressable` wrapper defaults for accessibility role/state and disabled handling.

## Modular adoption + design polish

- **Patterns adopted in real screens (UI-only):**
  - `RecordingOverlay` + `RecorderHUD` are now mounted in `DrillScreen` while a drill is running (no business logic inside, props/callbacks only).
  - `WaveformCard` + `PlaybackOverlay` are now used in the Results attempts list via a new module.

- **New modules:**
  - `src/ui/modules/AttemptWaveformList.tsx` — renders attempts as a plug-and-play WaveformCard list (placeholder waveform + presentational playback overlay).
  - `src/ui/modules/journey/JourneyHeaderModule.tsx` — Journey header + tab switcher (adopted in JourneyScreen; dev-toggleable).
  - `src/ui/modules/results/ResultsScoreModule.tsx` — Results score card as a reusable module (adopted in ResultsScreen; dev-toggleable).
  - `src/ui/modules/results/ResultsShareModule.tsx` — Results share card as a reusable module (adopted in ResultsScreen; dev-toggleable).
  - Modules are exported from `@/ui` and previewed in Component Lab under a new **Modules** section.

- **Token polish:**
  - Expanded spacing scale (added 48/56).
  - Expanded typography scale (added 3XL; adjusted XL/2XL for clearer hierarchy).
  - Updated `Typography` presets so `h1` uses 2XL.

## 2026-02-22 (Modules expansion)
- Added JourneyNextUpModule and adopted it in JourneyScreen behind dev toggle `module.journey.nextUp`.
- Added shared modules: ScoreKpiRowModule and ShareActionsModule; Results modules now compose them.
- Component Lab: added previews for JourneyNextUpModule + shared modules.


## 2026-02-22 — Modularization pass
- Extracted JourneyNextUpMissionModule (mission details block).
- Split AttemptWaveformList into AttemptListModule + AttemptRowModule (AttemptWaveformList remains as back-compat wrapper).
- Added attempt_modules.test.tsx for module coverage.

## 2026-02-22 — Final modular blocks before EPICs
- Added shared building-block modules for consistent layouts:
  - `SectionHeaderModule`
  - `InlineStatModule`
  - `PrimaryActionBarModule`
- Added Journey `JourneyTabsModule` as a reusable tabs row.
- Added attempts variants:
  - `AttemptRowCompactModule`
  - `AttemptListCompactModule`
  - `AttemptListDetailedModule`
- Component Lab:
  - removed remaining hardcoded sample strings (uses `t()` everywhere)
  - added previews for new shared/journey/attempt modules.

## How to verify on your machine (recommended)

1) Install deps and generate a lockfile:

```bash
npm install
```

2) Run the full safety suite:

```bash
npm run ci
```

3) Boot the app:

```bash
npm start
```



## Important dependency fix (npm install)

If `npm install` fails with:
- `No matching version found for expo-status-bar@~54.0.2`

This repo targets **Expo SDK 54** and must use the versioned `expo-status-bar` package.

- `expo` is set to `~54.0.33`
- `expo-status-bar` is set to `~3.0.9`

If you change Expo SDK, run `npx expo install --fix` to realign versions.

---

# EPIC 11 — Core Loop Production Hardening (Completed)

This ZIP includes EPIC 11 upgrades focused on making the core loop feel shippable.

## EPIC 11 highlights

- **Attempt audio capture (WAV)** during drills
  - Captures mic frames and writes a `.wav` file to `FileSystem.cacheDirectory`.
  - The resulting URI is stored in `attempt.metrics.audioUri`.
  - Also stores `attempt.metrics.waveformPeaks` (0..100) + `audioDurationMs` for real waveform rendering.
  - PlaybackOverlay can now play/pause recent attempts.

- **Playback screen (real waveform + seek)**
  - New `Playback` screen renders a real waveform from `waveformPeaks` (or decodes WAV if missing).
  - Tap the waveform to **seek**; progress stays in sync with playback.
  - Results attempts include an **Open playback** action per attempt.

- **Best-take persistence**
  - New SQLite table `best_takes` maps `(sessionId, drillId) -> attemptId`.
  - Updated after each attempt via `upsertBestTakeForAttempt()`.
  - Results list shows **BEST TAKE** per drill.

- **Drill cancel/stop**
  - RecordingOverlay Stop button aborts an in-flight drill run (no crash / no alert).
  - Uses `DrillAbortError` and an AbortController signal.

- **Telemetry breadcrumbs + debug export (dev-only)**
  - Lightweight `track()` breadcrumbs in-memory.
  - Settings → QA → **Export debug report** shares a JSON payload via system Share.

## Notes

- WAV files are stored in cache and may be purged by OS. This is intentional for privacy and storage.
- If you want persistent “Saved takes”, we can add a user-controlled save/export path next.

---

# Phase 1 remaining items (now closed)

- **Real waveform + seek is now non-stub**
  - Waveform renders from `attempt.metrics.waveformPeaks`.
  - If peaks are missing (older attempts), the app decodes the WAV and generates peaks.
  - Seek supports **tap + drag** (scrub) via `WaveformSeek` responder handling.

- **Playback UI modularized**
  - New module: `WaveformPlayerModule` (waveform + progress + controls).
  - Playback screen uses the module (pure UI, logic stays in `useSoundPlayback`).

- **Perf budget is enforced in CI**
  - `npm run ci` now runs `perf:budget` after tests.
  - GitHub Actions CI runs `npm run ci`.

- **Lockfile policy**
  - Phase 1 expects a committed lockfile for deterministic installs.
  - See `docs/LOCKFILE.md`.
