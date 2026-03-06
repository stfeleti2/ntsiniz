# Phase 1 Completion Checklist

This is the shipping baseline for Phase 1.

## Install + CI

- [x] `npm install` succeeds (Expo SDK 54 aligned)
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run check:i18n`
- [x] `npm test` (core + UI)
- [x] `npm run perf:budget`
- [x] `npm run ci` runs all of the above

## Core app loop

- [x] Drill runner executes drill types from pack
- [x] Recording during drills
- [x] Attempt saved to SQLite
- [x] Best take persisted per (sessionId, drillId)
- [x] Results shows attempts + BEST TAKE

## Playback + waveform

- [x] WAV capture for each attempt (`metrics.audioUri`)
- [x] Waveform data stored (`metrics.waveformPeaks`, `audioDurationMs`)
- [x] Waveform renders in Results attempt list
- [x] PlaybackOverlay play/pause works
- [x] Seek works (tap + drag) and stays in sync
- [x] Dedicated Playback screen exists

## i18n + packs

- [x] No new hardcoded strings in screens/modules (CI-enforced)
- [x] Locale switching supported
- [x] Pack-per-locale loader with fallback

## QA + release

- [x] `docs/QA_CHECKLIST.md`
- [x] `docs/RELEASE_CHECKLIST.md`
- [x] `docs/STORE_COPY.md`
- [x] `docs/PRIVACY_COPY.md`
- [x] Debug export (dev-only)

## Deterministic installs (required)

- [ ] Commit `package-lock.json` once after a clean install.
  - See `docs/LOCKFILE.md`.
