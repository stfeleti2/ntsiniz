# Ntsiniz Release Checklist

## Pre-flight

- [ ] Pull latest `main`
- [ ] Ensure lockfile exists (`package-lock.json`)
- [ ] Clean install (`npm ci`)
- [ ] Run `npm run ci`
- [ ] Run GitHub Action: **Release Gate (Deterministic)** (`.github/workflows/release-gate.yml`)

## Functional QA

- [ ] Run through **Recording → Save → Results → Playback screen**
- [ ] Verify waveform renders (not placeholder) and tap-to-seek updates playback position
- [ ] Run through a full drill session and verify scoring is stable
- [ ] Verify packs load offline
- [ ] Store build: run Maestro guard `maestro/01_store_build_surfaces.yml` against a `STORE_BUILD=true` build

### EPIC 11 hardening

- [ ] PlaybackOverlay works on device (at least one attempt can play/pause)
- [ ] Drill cancel works (Stop button cancels cleanly)
- [ ] Best-takes show as **BEST TAKE** in Results list
- [ ] Dev-only: Settings → QA → **Export debug report** shares JSON

## Device QA (minimum)

- [ ] Low-end Android
- [ ] Mid Android
- [ ] iPhone

## Store / permissions

- [ ] iOS: microphone permission strings are correct
- [ ] Android: microphone permissions declared and prompt works
- [ ] Privacy copy updated if any data collection changes
- [ ] If monetization changed: complete `docs/MONETIZATION_COMPLIANCE.md`

## Crash visibility (Sentry)

- [ ] Ensure `SENTRY_DSN` is set for the build environment (EAS secrets / CI)
- [ ] Smoke-test a deliberate crash in a release build and confirm it appears in Sentry

## Performance

- [ ] No major UI jank in tuner/drill screen
- [ ] Audio capture is stable for 5+ minutes
- [ ] Optional: run `npm run build:core && npm run perf:budget`

## Build & ship

- [ ] Build Android release (AAB/APK) and smoke test install
- [ ] Build iOS release and smoke test
- [ ] Tag release + changelog
