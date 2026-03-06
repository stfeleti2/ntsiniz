# Device matrix (tiered)

We prioritize a premium experience for the majority of users.

Target mix:

* 50% mid-range
* 40% high-end
* 10% low-end

See: `docs/qa/DEVICE_MATRIX_TIERS.md`

## Devices (minimum)

* 1× **High-end** (iOS or Android)
* 2× **Mid-range** (Android vendor variance)
* 1× **Low-end** (Android)

## Scenarios (must pass)
- Onboarding (permission allow/deny/recover)
- Calibration (complete, then re-calibrate)
- Drill (record 60–120s with overlay)
- Results (explainability visible)
- Playback (waveform + seek)
- Premium paywall (purchase + restore in sandbox)
- Background/foreground resilience

## Notes
- Test with a noisy environment and a quiet environment.
- Test with phone speaker on/off if relevant to feedback audio.
