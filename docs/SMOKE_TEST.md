# Smoke test (manual)

Goal: verify the **core practice loop** works on real devices.

## Preconditions

- Fresh install (or clear app storage)
- Microphone permission is **not yet granted** (first run)

## Steps

1) Open app → Home loads without red screens
2) Start any drill
3) If prompted for mic permission:
   - Deny once → verify you land in the permission primer and can retry
   - Grant → verify drill starts recording
4) Sing/record for at least 5 seconds
5) Stop → verify results screen appears
6) Playback:
   - Tap play → waveform cursor moves smoothly
   - Tap waveform to seek → cursor aligns with tap position (including near edges)
7) Save proof:
   - Complete the drill twice with different scores
   - Verify the **best take** does not regress (best score remains best)

## Expected outputs

- No crashes
- No "stuck" permission state after enabling mic in OS settings
- Waveform seek is accurate across the full width
- Attempts persisted (history / best take shown)


## Background/interruption safety
1. Start a drill and begin recording.
2. Send the app to background (home button) for 2–3 seconds.
3. Return to app.
**Expected:** drill aborts cleanly (no stuck recording), and user can start again.
