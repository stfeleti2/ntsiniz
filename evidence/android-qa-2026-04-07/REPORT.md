# Android QA Evidence (2026-04-07)

## Environment
- Device: `emulator-5554` (`Pixel_9`, Android 36 image)
- App package: `com.ntsiniz.app`
- Build mode: Expo dev client (`npm run android`)
- Screen: `1080x2424`, density `420`

## Reproduction Summary
1. Launch app in emulator.
2. Dismiss crash telemetry prompt and Expo dev overlay.
3. Complete onboarding level select.
4. Open mic permission flow and trigger OS permission popup.
5. Deny permission, retry, then allow permission.
6. Attempt to continue to first drill from granted mic state.

## Findings With Evidence

### 1) Real OS mic popup is shown (works)
- Evidence image: `10-after-multi-tap-mic-request.png`
- Evidence image: `12-retry-shows-popup.png`
- Notes:
  - Android permission sheet appears with:
    - `While using the app`
    - `Only this time`
    - `Don't allow`

### 2) Permission state transitions render correctly (works)
- Denied UI: `11-after-deny-mic.png`
- Granted UI: `13-after-allow-mic.png`
- Permission denied state dump: `11-permission-state.txt`
- Permission granted state dump: `18-permission-after-allow.txt`

### 3) Blocker: onboarding cannot advance from mic-granted screen
- Triggered on screen with CTA: `Begin first exercise`
- Before/after images (no transition):
  - `13-after-allow-mic.png`
  - `14-first-drill-entry.png`
  - `15-after-multi-begin-taps.png`
  - `19-after-begin-wait-10s.png`
- Video evidence:
  - `20-onboarding-stuck.mp4` (multiple taps, screen remains on mic-granted step)
- Severity: High (first-run flow blocked before first drill/range finder)

### 4) Major frame-time/jank pressure during onboarding
- Repeated UI thread frame skips and long HWUI frame durations:
  - `21-jank-signals.txt`
  - `17-logcat-pid.txt`
- Representative signals:
  - `Choreographer: Skipped 30-70+ frames`
  - `HWUI Davey duration=700ms-3000ms+`

## Raw Artifacts Index
- UI progression:
  - `01-initial.png`, `02-after-crash-prompt.png`, `03-level-selection-clean.png`, `05-after-back.png`
  - `06-after-level-continue.png`, `07-after-select-casual-and-continue.png`, `08-after-correct-continue-tap.png`
  - `09-after-request-mic.png`, `10-after-multi-tap-mic-request.png`
  - `11-after-deny-mic.png`, `12-retry-shows-popup.png`, `13-after-allow-mic.png`
  - `14-first-drill-entry.png`, `15-after-multi-begin-taps.png`, `19-after-begin-wait-10s.png`
- XML/UI tree:
  - `01-initial.xml`, `02-after-crash-prompt.xml`, `04-level-selection-visible.xml`, `05-after-back.xml`
- Logs:
  - `10-tail-logcat.txt`, `15-tail-logcat.txt`, `17-logcat-pid.txt`, `21-jank-signals.txt`

