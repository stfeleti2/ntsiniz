# Ntsiniz QA Checklist

## Device matrix

Minimum smoke matrix (per release candidate):

- **Low-end Android** (2–4GB RAM, older CPU)
- **Mid Android** (6–8GB RAM)
- **iPhone** (any recent iOS version you support)

## Core flows

### Recording

- Mic permission prompt shows correctly (allow/deny/blocked)
- Start recording does not freeze UI
- Pause/Resume works (if available in the current flow)
- Stop saves the take and returns to the expected screen
- Stop during a drill cancels cleanly (no crash, returns to idle)
- Background/foreground app during recording behaves safely

### Playback + waveform

- Playback starts/stops reliably
- PlaybackOverlay play/pause works for recent attempts
- Tap-to-seek on waveform updates time/progress correctly
- Waveform renders and stays in sync with playback (Results + Playback screen)
- Replay the same take multiple times without audio glitches

### Packs + drills

- Packs load offline (airplane mode)
- Drill runner can complete a session end-to-end
- Scores are repeatable (same input → similar score)

## Reliability

- Cold start (app killed) → launch is stable
- Resume from background is stable
- No crash loops on denied permissions

## Offline checks

- Airplane mode: app still boots
- Previously downloaded/pack content still accessible
- Sharing/export gracefully fails or queues when offline

## Performance checks

- No obvious frame drops in tuner UI while capturing audio
- Recording overlay (if enabled later) does not tank FPS
- Memory does not continuously grow during a long session (5–10 min)

## i18n checks

- No new hardcoded user-facing strings in new UI library work
- UI fits on small screens (text truncation/overflows)
- RTL readiness sanity (no hard assumptions in primitives)

## UI Library sanity

- Component Lab opens in **dev only**
- Buttons/Inputs have `testID` where relevant
- Basic accessibility labels present on pressables


## Perf evidence

- [ ] Complete docs/PERF_EVIDENCE.md for this build (using Settings → Diagnostics)
