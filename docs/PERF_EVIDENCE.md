# Perf Evidence (Release Artifact)

This file is **required** for any public release.

Goal: prove **60fps UI** and **stable audio** on real devices during:
- Drill recording + overlay
- Playback + waveform seek
- Home → Drill → Results loop

## How to collect

### Option A: Auto-capture (dev builds)

Use **Audio Torture Lab → Capture + Share (10s)** to generate a paste-ready snippet.

It exports in the app cache under `cache:/perf/`:
- `perf_evidence_<ts>.json`
- `perf_evidence_<ts>.md` (paste into the Evidence table section below)

Share the markdown from device, then commit the resulting entry into this file.

### Option B: Manual (Diagnostics)

1. Open **Settings → Diagnostics** in the app.
2. Start a drill and sing for 30–60s.
3. Return to Diagnostics and record:
   - `uiStallCount`
   - `worstUiStallMs`
   - `frameBusDropped`
   - `frameBusQueueMax`
   - `qualityTier`
4. Repeat for each device in the matrix below.

## Device matrix (minimum)

| Tier | Device | OS | Notes |
|---|---|---|---|
| Low-end Android |  |  | 2–4GB RAM, mid/low CPU |
| Mid Android |  |  | |
| Older iPhone |  |  | iPhone 8 / SE2 / similar |
| Current iPhone |  |  | |

## Evidence table (fill in)

| Date | App build | Device | Drill | Duration | uiStallCount | worstUiStallMs | frameBusDropped | queueMax | qualityTier | Pass |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|
|  |  |  |  |  |  |  |  |  |  |  |

## Pass/Fail rubric

✅ Pass if ALL are true:
- worst UI stall <= **50ms**
- ui stalls per 60s <= **2**
- frameBusDropped per 60s <= **2**
- Audio remains stable (no “robot”, no dropouts)

🟡 Needs work:
- stalls or drops above threshold but drill remains usable

⛔ Fail:
- noticeable jank during recording, or audio breaks, or frequent drops

