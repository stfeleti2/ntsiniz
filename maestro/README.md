# Maestro E2E flows (quick QA)

These flows are meant for **dev builds** (Expo dev-client / `expo run:*` / EAS internal builds), not Expo Go.

## Why Maestro
Maestro is a simple, YAML-driven E2E runner that works on Android/iOS emulators and real devices.

## Install Maestro
Follow the official docs: https://docs.maestro.dev/

## Build & install your app
### Android (local)
```bash
npx expo prebuild -p android
npx expo run:android
```

### iOS (local, macOS)
```bash
npx expo prebuild -p ios
npx expo run:ios
```

> The bundle/package ID is set to **com.ntsiniz.app** in `app.config.ts`.

## Run the smoke flow
```bash
maestro test maestro/01_smoke_session_3drills.yml
```

## Run the share/export flow
```bash
maestro test maestro/02_weekly_share_and_csv.yml
```

### What it covers
- Starts from Welcome
- Uses the hidden **QA: Skip calibration** (tap "Ntsiniz" 7×)
  - This also turns on: simulated mic + mock share + permission bypass
- Completes 3 drills → Results
- Shares weekly report (asserts "Shared ✅")
- Relaunches app and checks Journey still shows "Weekly Report" (persistence)

## Manual permission prompt test ("prompts once")
This is OS-owned behavior. We test it in two layers:

1) **Logic test** (fast, deterministic): `pnpm test` includes `src/core/audio/permissionGate.test.ts`
   - verifies we only call the underlying permission request once

2) **Device test** (real OS dialog):
   - Turn off QA bypass: Settings → tap "Settings" 7× → QA tools → disable bypass
   - Reset microphone permission for the app
     - iOS simulator: `xcrun simctl privacy booted reset Microphone com.ntsiniz.app`
     - Android emulator: `adb shell pm reset-permissions com.ntsiniz.app`
   - Start a drill twice
   - Confirm the system dialog only appears the first time
