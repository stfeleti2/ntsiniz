# Detox E2E (deep QA)

Detox is great for **automated regression** of key flows (drills, shareables, persistence) on simulators/emulators.

> Detox permissions via `device.launchApp({ permissions })` are **iOS simulator only**. On Android, you can pre-grant mic permission with `adb`.

## 1) Prebuild native projects

```bash
npx expo prebuild
```

## 2) iOS (macOS)

```bash
pnpm e2e:detox:build:ios
pnpm e2e:detox:test:ios
```

If your scheme/workspace is named differently, update `.detoxrc.js`.

## 3) Android

```bash
pnpm e2e:detox:build:android

# Grant mic permission (optional but recommended)
adb shell pm grant com.ntsiniz.app android.permission.RECORD_AUDIO || true

pnpm e2e:detox:test:android
```

## E2E mode (stable automation)

Our E2E tests use the hidden QA shortcut:

- Tap the “Ntsiniz” title 7×
- Tap **QA: Skip calibration**

This enables:

- Simulated mic (drills can complete deterministically)
- Mock share sheet (asserts “Shared ✅” without OS UI)
- Permission bypass (reduces flakiness)
