# Ntsiniz — Stability + Market Ready Plan

Last updated: 2026-03-04  
Repo base: `ntsiniz_pro_regimen12_3tracks_policy_v2.zip` (the most recent readable zip in this environment).  
Note: `ntsiniz_transfer_blocks_metadata.zip` exists but is **not a valid zip** (`zipfile.is_zipfile == False`), so it could not be inspected.

## 1) System map (≤12 lines)
- Audio capture + realtime loop: `src/core/audio/micStream.ts` → `src/core/audio/frameBus.ts` → `src/core/pitch/pitchTruth.ts`/`pitchEngine.ts` → `src/core/drills/drillExecutor.ts` → `src/core/drills/runnerMachine.ts`.
- Recording to disk: `src/core/audio/attemptWavRecorder.ts` writes **WAV 16-bit mono** to `FileSystem.cacheDirectory/ntsiniz/takes`.
- Playback + waveform: waveform peaks computed in recorder and stored in attempt metrics; UI uses `src/app/screens/PlaybackScreen.tsx` + `src/ui/patterns/WaveformSeek.tsx`.
- Scoring/adaptation: `src/core/scoring/drillScoring.ts` (anti-frustration + adaptive strictness).
- Curriculum/progress: `src/core/curriculum/*`, `src/core/progress/*`, rendered in Home/Session/Curriculum screens under `src/app/screens/*`.
- Storage: SQLite schema `src/core/storage/db.ts`; repos `attemptsRepo.ts`, `bestTakesRepo.ts`, `profileRepo.ts`, `sessionsRepo.ts`.
- Telemetry: typed events `src/app/telemetry/events.ts`, consent gate `src/app/telemetry/gate.ts`, reporting `src/app/telemetry/report.ts`.
- Billing: RevenueCat wrapper `src/core/billing/revenuecat.ts`, entitlements `src/core/billing/entitlementsRepo.ts`.
- Content integrity: manifest/signature scripts under `scripts/*`, runtime verification under `src/core/content/*`.
- Highest risk: realtime cadence + overlay (`drillExecutor.ts` + `GhostGuideOverlay.tsx`), interruptions/audio session (`src/core/audio/session.ts`), and base64-heavy utilities (`src/app/audio/wavDecode.ts`, `wavMix.ts`).

## 1.1 Current recording pipeline (evidence)
- Library: `expo-stream-audio` in `src/core/audio/micStream.ts` (calls `start({ sampleRate, frameDurationMs })`).
- Sample rate: fixed **44100 Hz** in `src/core/drills/drillExecutor.ts` (`const sampleRate = 44100`, `frameMs = 20`).
- Channels/bit depth/file: disk recorder encodes **WAV PCM16 mono** via `encodeWav16Mono` in `src/core/audio/attemptWavRecorder.ts`.
- Latency/frames: mic frames are 20ms, queued into `FrameBus` (`src/core/audio/frameBus.ts`), pitch analysis uses stride (`getAudioAnalysisStride` in `drillExecutor.ts`).

## 1.2 Live feedback path
- Pitch frames: `PitchTruth` wraps `PitchEngine` to stabilize readings (`noteChangeConfirmFrames`) in `src/core/pitch/pitchTruth.ts`.
- Diagnostics to UI: `drivers.onGhostFrame` in `src/core/drills/drillExecutor.ts` emits `reading`, `ghost`, and `diag` (quiet/low-confidence).
- UI throttle: `DrillScreen` throttles UI updates to ~15fps (`lastGhostUiUpdate`) in `src/app/screens/DrillScreen.tsx`.

## 1.3 Waveform/seek
- Waveform peaks are computed at record time and stored per attempt (`waveformPeaks`) in metrics in `src/core/drills/registry.ts`.
- Seek mapping uses padding-aware math (`src/ui/patterns/waveformMath.ts`) consumed by `src/ui/patterns/WaveformSeek.tsx`.

## 1.4 Storage/persistence
- Attempts stored in SQLite `attempts` table (`metrics` JSON) in `src/core/storage/db.ts`.
- Best takes maintained via UPSERT in `src/core/storage/bestTakesRepo.ts` and `addAttemptAndUpdateBestTake` in `src/core/storage/attemptsRepo.ts`.

## 1.5 Telemetry flows
- Sentry capture is routed via `captureException` and gated by consent in `src/app/telemetry/gate.ts`.
- Event schema enforced against docs by scripts (e.g. `scripts/check-telemetry-truth.mjs`).

## 2) Scorecards

### A) Stability + Release scorecard

- 🟡 **Interruptions/route change handling** — Evidence: `src/core/audio/session.ts`, `src/app/screens/DrillScreen.tsx`. Fix: Centralize interruption broker at app root (see Gate 2) and fan-out to drill/playback.

- 🟡 **App lifecycle bg/fg/lock while recording** — Evidence: `src/app/screens/DrillScreen.tsx`. Fix: Use centralized broker + ensure recorder finalizes/aborts deterministically on background; add recovery banner.

- ✅ **Offline-first practice reliability** — Evidence: `src/core/storage/db.ts`, `src/core/storage/attemptsRepo.ts`, `src/core/storage/bestTakesRepo.ts`. Fix: Keep SQLite-first; ensure any cloud sync is optional.

- 🟡 **Data safety (atomic saves + recovery)** — Evidence: `src/core/audio/attemptWavRecorder.ts`, `src/core/storage/attemptsRepo.ts`. Fix: Write takes to temp then rename; add recovery flow for orphaned temp takes.

- 🟡 **Error handling + crash safety boundaries** — Evidence: `src/app/telemetry/report.ts`, `src/core/observability/logger.ts`. Fix: Add error boundary at root + enforce no-empty-catch via lint.

- 🟡 **CI/build/release scripts + QA checklist** — Evidence: `package.json`, `docs/QA_CHECKLIST.md`, `scripts/perf-budget.mjs`. Fix: Add killer-loop Maestro E2E + release-only gates for perf evidence and store forms.


### B) Product + Principles scorecard

- 🟡 **Killer feature loop quality** — Evidence: `src/app/screens/DrillScreen.tsx`, `src/app/screens/PlaybackScreen.tsx`, `src/core/storage/attemptsRepo.ts`. Fix: Enforce NextActionBar + ProgressMoment on all killer-loop screens; add E2E smoke.

- 🟡 **60fps during recording** — Evidence: `src/core/audio/frameBus.ts`, `src/ui/ghost/GhostGuideOverlay.tsx`. Fix: Decompose/memoize overlay + add perf HUD + commit perf evidence.

- ✅ **Adaptive scoring quality** — Evidence: `src/core/scoring/drillScoring.ts`. Fix: Continue tuning thresholds; add edge-case tests.

- 🟡 **“What next” always visible** — Evidence: `src/ui/components/NextActionBar.tsx`, `src/app/screens/HomeScreen.tsx`. Fix: Create `KillerLoopLayout` wrapper and CI scan to prevent regressions.

- 🟡 **No dev fallbacks in prod** — Evidence: `src/ui/modules/devModules.tsx`, `src/app/navigation/surfaceScreens.ts`. Fix: Core-loop nav allowlist in production builds.

- 🟡 **Telemetry truth alignment** — Evidence: `src/app/telemetry/events.ts`, `docs/privacy/TELEMETRY_TRUTH_TABLE.md`. Fix: Add PII lint gate + store forms snapshot required for release.

- ✅ **Offline-tolerant practice** — Evidence: `src/core/storage/db.ts`. Fix: Keep SQLite-first; avoid network dependency in drill run.

- 🟡 **i18n-ready scaffolding complete** — Evidence: `src/core/i18n/index.ts`, `scripts/check-i18n.mjs`. Fix: Add Intl number/date/plural support + broaden scanner to Alert/labels/accessibility.


## 3) Recording quality plan (best mic capture)

### 3.1 Current limits (repo evidence)
- Fixed 44.1kHz/20ms: `src/core/drills/drillExecutor.ts`.
- WAV encoding is PCM16 mono; base64 intermediate may create allocation spikes: `src/core/audio/attemptWavRecorder.ts`.
- No explicit input-route detection in JS (Bluetooth/headset): no module exposes it today → needs native bridge (🟡).

### 3.2 iOS best practices (implementation targets)
- Use a single session owner (`src/core/audio/session.ts`) and set **recording mode** before capture.
- Prefer `AVAudioSessionCategoryPlayAndRecord` with `mode` tuned for voice (e.g. `measurement`/`voiceChat`) depending on latency vs processing; keep options for Bluetooth input if you allow it.
- Choose sample rate by device: try 48k then fallback; set IO buffer duration based on frameMs.
- Handle interruptions + route changes via a centralized broker (Gate 2), finalize/abort recorder safely.
- Clipping: detect peak/clipped frames (added in this patch via PitchEngine + recorder stats) and surface warnings in UI.

### 3.3 Android best practices (implementation targets)
- Use the most appropriate AudioSource for voice (voice recognition/communication vs mic) depending on desired processing and route stability.
- Negotiate supported sample rates (48k preferred) and size buffers to avoid underruns.
- Handle audio focus + route changes via broker; communicate Bluetooth mic quality constraints.

### 3.4 Library decision
- Current capture uses `expo-stream-audio` (`src/core/audio/micStream.ts`). Keep for now to avoid risky migration.
- If you observe route-change instability or unacceptable latency on Android low-end, plan a staged move to a dedicated native module (AAudio/Oboe + AVAudioEngine) behind the same Drivers interface in `src/core/drills/drillExecutor.ts`.

### 3.5 Recording-time safety features (implemented + planned)
- ✅ Live mic level + clipping warnings wired via `PitchEngine` peak/clipped → `DrillScreen` UI (`src/ui/components/MicLevelMeter.tsx`, `src/app/screens/DrillScreen.tsx`).
- ✅ Recording stats persisted in attempt metrics (WAV peaks + clipped frames) via `attemptWavRecorder.ts` and merged in `DrillScreen` before persistence.
- 🟡 Route indicator (Built-in/Headset/Bluetooth) requires a small native bridge (not present).
- 🟡 Optional mic-check calibration step: should measure noise floor + peak in a 3s sample and store in settings.


## 4) Top 10 UI improvements (market polish)

1. **Mic level meter + clipping indicator during record** — Where: `src/app/screens/DrillScreen.tsx`, `src/ui/components/MicLevelMeter.tsx`. AC: Always visible while recording; shows warning if clipped for >N frames.

2. **Route indicator + Bluetooth quality hint** — Where: `src/app/screens/DrillScreen.tsx`. AC: Show input route; warn when BT mic active; suggest wired/built-in.

3. **Recovery banner for last take if crash/background occurred** — Where: `src/app/screens/HomeScreen.tsx`, `src/core/audio/attemptWavRecorder.ts`. AC: Detect orphaned temp takes; offer recover/delete.

4. **Playback scrubbing polish** — Where: `src/app/screens/PlaybackScreen.tsx`, `src/ui/patterns/WaveformSeek.tsx`. AC: Scrub feels stable; cursor matches audio time; no jumps.

5. **Consistent ProgressMoment after save** — Where: `src/app/screens/DrillResultScreen.tsx`, `src/ui/components/ProgressMoment.tsx`. AC: Same celebration + next step across flows.

6. **Accessibility: touch targets + labels** — Where: `src/ui/components/*`, `src/app/screens/*`. AC: All primary controls have accessibility labels; min 44dp hit targets.

7. **Empty state: no packs/lessons** — Where: `src/app/screens/CurriculumOverviewScreen.tsx`. AC: Clear action to download/select program.

8. **“What next” pinned on killer loop screens** — Where: `src/ui/components/NextActionBar.tsx`. AC: Cannot scroll away; always visible.

9. **Mic permission denied recovery** — Where: `src/app/screens/PermissionsPrimerScreen.tsx`, `src/core/audio/permissionGate.ts`. AC: One-tap retry; consistent UI.

10. **Diagnostics for support** — Where: `src/app/screens/DiagnosticsScreen.tsx`. AC: Show last session audio stats, sampleRate, clipped frames, frameBus drops.


## 5) Gate-based implementation plan (Gates 1–9)
This is the execution plan to ship a market-ready build centered on the killer loop.

### Gate 1 — Repo health + guardrails

**Objectives:** Repeatable verification; prevent drift from killer loop.


**Tasks**

- ☐ Ensure `npm run ci` runs lint/typecheck/unit tests/build check.

- ☐ Add lockfile enforcement for releases.

- ☐ Add E2E entrypoint for killer loop (Maestro).


**Files/modules**

- `package.json`

- `scripts/*`

- `docs/QA_CHECKLIST.md`

- `maestro/*`


**Acceptance criteria**

- `npm run ci` green on fresh clone.

- Release branch fails without lockfile and perf evidence.


**Tests/verification**

- npm run ci

- npm run e2e:killer-loop (Maestro)


**Risks + mitigations**

- CI drift → keep gates minimal and deterministic.



### Gate 2 — Recording stability foundations

**Objectives:** No corrupted files; safe behavior on interruptions/route changes.


**Tasks**

- ☐ Centralize interruptions broker (AppState + audio interruptions).

- ☐ Ensure recorder abort/finalize on background and show recovery banner.

- ☐ Single audio-session owner enforced.


**Files/modules**

- `src/core/audio/session.ts`

- `src/core/audio/interruptions.ts (new)`

- `src/app/screens/DrillScreen.tsx`


**Acceptance criteria**

- Backgrounding mid-record ends in safe state; no stuck mic.

- No direct audio-mode calls outside session manager.


**Tests/verification**

- Unit tests for broker

- Manual device: call interrupt, lock/unlock, BT connect/disconnect


**Risks + mitigations**

- Interruption APIs differ per OS → keep broker event model small.



### Gate 3 — Best recording quality (OS-specific)

**Objectives:** Improve capture quality and UX: meter, clipping prevention, mic-check, metadata.


**Tasks**

- ☐ Negotiate sample rate (48k preferred, fallback).

- ☐ Enable mic level metering + clipping detection.

- ☐ Optional mic-check calibration flow + save calibration in settings.

- ☐ Persist recording metadata per attempt.


**Files/modules**

- `src/core/audio/micStream.ts`

- `src/core/pitch/pitchEngine.ts`

- `src/core/audio/attemptWavRecorder.ts`

- `src/app/screens/DrillScreen.tsx`


**Acceptance criteria**

- Clipping is detected and user warned.

- Attempt metrics include sample rate and peak/clipped stats.


**Tests/verification**

- Unit tests for clip thresholds

- Manual: loud sing test shows warning


**Risks + mitigations**

- Over-warning on peaks → use conservative threshold and require sustained clipping.



### Gate 4 — Performance (60fps during record)

**Objectives:** No jank with overlay; maintain audio cadence.


**Tasks**

- ☐ Decompose/memoize Ghost overlay; throttle state updates.

- ☐ Add dev perf HUD and capture evidence in docs.


**Files/modules**

- `src/ui/ghost/GhostGuideOverlay.tsx`

- `src/core/audio/frameBus.ts`

- `docs/PERF_EVIDENCE.md`


**Acceptance criteria**

- FrameBus drops near 0 on mid devices.

- Overlay renders/sec reduced.


**Tests/verification**

- Manual perf run + recorded evidence

- perf budget script


**Risks + mitigations**

- Premature optimization → measure first with HUD.



### Gate 5 — Data safety

**Objectives:** Atomic saves + recovery; disk-full handling.


**Tasks**

- ☐ Write takes to temp file then rename.

- ☐ Recovery scan for orphaned temp takes on app start.

- ☐ Handle disk-full gracefully (user message + retry).


**Files/modules**

- `src/core/audio/attemptWavRecorder.ts`

- `src/core/io/fileStore.ts`

- `src/app/screens/HomeScreen.tsx`


**Acceptance criteria**

- No partial WAV files in takes directory.

- Recovered takes appear with user CTA.


**Tests/verification**

- Integration test for atomic write path

- Manual kill app mid-save


**Risks + mitigations**

- File APIs vary on Android → keep fallback paths instrumented.



### Gate 6 — Offline-first

**Objectives:** Core loop works fully offline; sync optional.


**Tasks**

- ☐ Ensure drill run never depends on network.

- ☐ Sync queue retries and deadletter for safety.


**Files/modules**

- `src/core/cloud/syncEngine.ts`

- `src/core/storage/db.ts`


**Acceptance criteria**

- Airplane mode: full killer loop works.

- Sync failures do not block practice.


**Tests/verification**

- Unit tests for sync backoff/deadletter

- Manual offline run


**Risks + mitigations**

- Scope creep → keep sync optional and non-blocking.



### Gate 7 — Telemetry truth alignment

**Objectives:** No PII leaks; store forms match reality.


**Tasks**

- ☐ Maintain truth table docs.

- ☐ Add PII lint gate for telemetry payload keys.

- ☐ Release-only store forms snapshot required.


**Files/modules**

- `src/app/telemetry/*`

- `docs/privacy/*`

- `scripts/check-telemetry-*.mjs`


**Acceptance criteria**

- Telemetry toggle off produces zero captures.

- CI blocks PII-ish payload keys.


**Tests/verification**

- npm run check:telemetry

- Manual toggle test


**Risks + mitigations**

- False positives → explicit allowlist in script.



### Gate 8 — UI market polish

**Objectives:** Make recording/playback feel pro; clear recovery states; accessibility baseline.


**Tasks**

- ☐ Route indicator + BT hint (requires native bridge).

- ☐ Empty states + recovery states.

- ☐ Playback scrubbing polish and accessibility labels.


**Files/modules**

- `src/app/screens/DrillScreen.tsx`

- `src/app/screens/PlaybackScreen.tsx`

- `src/ui/components/*`


**Acceptance criteria**

- User never gets stuck; next step always visible.

- Seek feels correct and stable.


**Tests/verification**

- Manual UX walkthrough

- Accessibility audit


**Risks + mitigations**

- Native route detection cost → keep as optional addon.



### Gate 9 — Release readiness

**Objectives:** Device QA matrix + automated smoke + perf budget + final checklist.


**Tasks**

- ☐ Maintain device matrix (low/mid/high).

- ☐ Run Maestro killer-loop test in CI for release.

- ☐ Perf budget + perf evidence required.


**Files/modules**

- `docs/qa/DEVICE_MATRIX.md`

- `maestro/killer_loop.yaml`

- `scripts/perf-budget.mjs`


**Acceptance criteria**

- Release checklist can be completed from repo artifacts.

- No placeholders in perf evidence on release.


**Tests/verification**

- npm run ci

- npm run e2e:killer-loop

- RELEASE=1 npm run check:*


**Risks + mitigations**

- Device coverage gaps → start with 3 representative devices.




## Gate 2/3 Implementation (Added)

- Native audio route module: `modules/ntsiniz-audio-route` (Expo module) exposes `getCurrentRoute`, `listInputs`, `setPreferredInput`, and emits `routeChanged`.
- JS broker: `src/core/audio/routeBroker.ts` + `src/core/audio/routeManager.ts`.
- Interruptions stream includes route changes: `src/core/audio/interruptions.ts`.
- UX: `src/ui/components/AudioRoutePill.tsx` + `AudioInputPicker.tsx` used in `src/app/screens/DrillScreen.tsx`; preferences in `src/app/screens/SettingsScreen.tsx`.
