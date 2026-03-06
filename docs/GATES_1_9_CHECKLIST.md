# Gates 1–9 Completion Checklist

Legend: ✅ done · 🟡 partial · ⛔ missing

## Gate 1 — Guardrails + core-loop focus
- ✅ Core loop surface allowlist (store builds hide non-core screens): `src/app/navigation/surfaceScreens.ts`
- 🟡 Lockfile required gate: `scripts/check-lockfile.mjs` (enforce with `STRICT_LOCKFILE=1`); **package-lock.json must be generated on your machine and committed**
- ✅ No TODO/FIXME/TBD in core (except ALLOW_TODO_CORE): `scripts/check-no-todo-core.mjs`

## Gate 2 — Audio correctness (session + interruptions)
- ✅ Single owner of Audio mode: `src/core/audio/session.ts` + CI `scripts/check-audio-mode-ownership.mjs`
- ✅ Central interruptions broker: `src/core/audio/interruptions.ts` (wired in `App.tsx`)
- ✅ Drill/Playback respond to interruptions: `src/app/screens/DrillScreen.tsx`, `src/app/screens/PlaybackScreen.tsx`

## Gate 3 — Killer loop UX enforcement (“What next?”)
- ✅ NextActionBar is present on core loop screens (CI enforced): `scripts/check-next-action.mjs`
- ✅ DrillScreen “ready” next-action: `src/app/screens/DrillScreen.tsx`
- ✅ DrillResultScreen “next/playback” actions: `src/app/screens/DrillResultScreen.tsx`
- ✅ NextActionBar supports testIDs for automation: `src/ui/components/NextActionBar.tsx`

## Gate 4 — Performance discipline
- ✅ FrameBus scheduling avoids microtasks: `src/core/audio/frameBus.ts`
- ✅ Perf snapshot visible in Diagnostics: `src/app/screens/DiagnosticsScreen.tsx`
- ✅ Perf evidence gate script (enforce with RELEASE=1): `scripts/check-perf-evidence.mjs`

## Gate 5 — Waveform correctness
- ✅ Seek math unit tests: `src/ui/testing/tests/waveform_math.test.ts`
- ✅ Padding-aware mapping used by waveform UI: `src/ui/patterns/WaveformSeek.tsx`

## Gate 6 — Data integrity
- ✅ Best-take UPSERT behavior proven (SQL-level): `src/core/tests/bestTakesRepo_sql.test.ts`
- ✅ Attempt + best-take unified API: `src/core/storage/attemptsRepo.ts`
- ✅ Streak/progress invariants tests: `src/core/tests/weekly.test.ts`, `milestones.test.ts`, `sessionPlan.test.ts`

## Gate 7 — Offline + sync reliability
- ✅ Backoff + deadletter support: `src/core/cloud/syncQueueRepo.ts`, `src/core/storage/db.ts`
- ✅ Unknown sync kinds never silently drop: `src/core/cloud/syncEngine.ts` → `moveSyncOpToDeadletter(...)`
- ✅ Transactional pull apply: `src/core/cloud/syncEngine.ts` uses `withTransaction(...)` from `src/core/storage/db.ts`

## Gate 8 — Telemetry truth + privacy
- ✅ Docs alignment gate: `scripts/check-telemetry-truth.mjs`
- ✅ PII key lint gate: `scripts/check-telemetry-pii.mjs`

## Gate 9 — i18n complete scaffolding (English-only content OK)
- ✅ Locale persisted in settings: `src/core/storage/settingsRepo.ts`
- ✅ Locale applied on startup: `App.tsx` calls `setCoreLocale(settings.language)`
- ✅ Intl formatting + plurals: `src/core/i18n/intl.ts` (re-exported from `src/core/i18n/index.ts`)
- ✅ Expanded hardcoded string scanner: `scripts/check-i18n.mjs`
- ✅ Locale switch UI (dev/hidden): `src/app/screens/SettingsScreen.tsx` (LANGS buttons)
