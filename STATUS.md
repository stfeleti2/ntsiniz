# Ntsiniz Guided Journey Patch Status

_Last updated: 2026-04-07_

## 1. Entry / first run
- ✅ `Welcome` reveal remains auto-advance/no-CTA with context variants.
- ✅ `Onboarding` level selection is persisted and influences helper density/tone/depth.
- ✅ `PermissionsPrimer` now refreshes state on focus and preserves trust-first per-state CTA flow.
- ✅ `WakeYourVoice` remains the real first live drill path (no detached calibration UI).
- ✅ `FirstWinResult` keeps post-drill closure and direct first-session handoff.

## 2. Home / plan
- ✅ `Home` uses premium backdrop, clearer voice summary, today hero, drill packs, and obvious next action.
- ✅ `Session` (“Today’s plan”) keeps stage tabs + stacked drill cards with status/difficulty/progress.
- ✅ Now/why/next copy is surfaced through i18n-backed guidance lines.

## 3. Lesson / teach
- ✅ `LessonIntro` remains visual-first with reduced text density and clear start/help actions.
- ✅ Technique explainer flow stays connected to existing guided lesson/session architecture.

## 4. Live drills
- ✅ `WakeYourVoice` and `Drill` surfaces use stable karaoke-style rails, playhead, live trace, and compact controls.
- ✅ `WakeYourVoice` quality gating covers noisy/quiet/no-voice/silence/clipping/route-change/permission loss.
- ✅ Recovery handoff from onboarding drill is explicit (`Open recovery help`) without breaking retry flow.

## 5. Result / playback
- ✅ `FirstWinResult` and drill-result closure remain motivating and next-step driven.
- ✅ `Playback` preserves the sacred loop (`Record -> Playback -> Save Best -> Next`) with no interruption surfaces.
- ✅ Save-best and compare flows remain available and route-safe.

## 6. Profile / progress
- ✅ `VoiceProfile` now includes stronger likely-zone/range visual summary with premium range panel.
- ✅ `RangeSnapshot` now uses the premium ladder/trace + compact playback controls.
- ✅ Likely-zone language remains “closest to”/confidence-safe.

## 7. Recovery / trust
- ✅ `Recovery` variants remain calm and non-blaming for noisy room, too quiet, permission lost/blocked, route change, clipping, and silence.
- ✅ Primary retry/settings actions remain simple and deterministic.

## 8. Engine / runner integration
- ✅ Onboarding first drill scoring remains on shared scoring semantics via onboarding adapter.
- ✅ Capture preflight now returns explicit permission state (`granted/denied/blocked/error`) plus route stability.
- ✅ DSP now has native-module sync fast-path wiring with JS fallback, plus deterministic room-read state thresholds and route-health quality gating.
- ✅ Native DSP session handling is integrated end-to-end in onboarding room-read/live drill execution paths (hard-cutover default path).

## 9. Monetization-safe integration
- ✅ Passive monetization remains blocked on onboarding, mic trust, active drill, playback/save-best, and recovery.
- ✅ Safe monetization stays on allowed closure/user-initiated surfaces.

## 10. QA / polish
- ✅ `npm run typecheck`
- ✅ `npm run lint`
- ✅ `npm run check:i18n`
- ✅ `npm run check:locale-formatting`
- ✅ `npm run check:next-action`
- ✅ `npm run check:telemetry`
- ✅ `npm run check:telemetry-pii`
- ✅ `npm test`
- ✅ `npm run ci:fast`
