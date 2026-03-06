# QA Checklist (Tiered: High / Mid / Low)

## Must-not-break (all tiers)

1. Cold start → Home renders (no crash)
2. Start drill → mic permission path works
3. Drill runs 60–90s → stable pitch UI
4. End drill → score + breakdown shown
5. Playback → waveform seek works
6. Best take saved + re-openable
7. Share card export works (local)

## High-end (HIGH)

* Quality mode in AUTO should land on **HIGH**.
* Verify premium effects:
  * glow cards and overlays visible
  * smooth celebration animations
  * waveform dense and smooth
* Perf checks:
  * p95 stalls ≤ 160ms
  * 0 FrameBus drops

## Mid-range (BALANCED)

* AUTO should land on **BALANCED**.
* Perf checks:
  * p95 stalls ≤ 220ms
  * 0 FrameBus drops in typical drill

## Low-end (LITE)

* AUTO should land on **LITE**.
* Effects degrade acceptably:
  * fewer particles
  * reduced shadow intensity
  * waveform less dense
* Floor checks:
  * app usable, no crashes
  * p95 stalls ≤ 450ms
  * if drops occur, they do not cascade into broken UI

## Logs to capture per device

* Dev perf overlay screenshot during drill + playback
* Quality mode + tier
* p95 + worst stalls
* FrameBus queue + dropped
