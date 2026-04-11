# Ntsiniz

Ntsiniz is an audio-first singing coach app built with Expo + React Native.

This repo contains:
- the mobile app
- local native audio modules
- Storybook / UI sandbox for fast iteration
- drill engine, scoring, and playback systems

---

## What Ntsiniz Does

Ntsiniz helps users improve singing through guided drills:

1. Select a drill
2. Hear the reference
3. Sing / record
4. Get live pitch feedback
5. Replay / review
6. Save best take
7. Track progress over time

---

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Dev Client
- React Native Reanimated
- Storybook (on-device)
- Local native modules for audio DSP

---

## Prerequisites

Make sure you have:

- Node.js `>=20.19.0 <25`
- npm `>=10`
- Git

### iOS
- Xcode
- CocoaPods
- iOS Simulator

### Android
- Android Studio
- Android SDK
- Android Emulator

### Notes
- This repo uses strict engine checks.
- Wrong Node / npm versions will fail install.
- Recommended: use `nvm`.

```bash
nvm use
````

---

## Getting Started

### 1. Install dependencies

```bash
npm ci
```

### 2. Optional: set local env

```bash
cp .env.example .env
```

Fill in:

* Sentry (optional)
* RevenueCat (optional)
* any local overrides

---

## Running the App

> Important: This app uses native modules. Expo Go is **not supported**.

### iOS dev build

```bash
npm run ios
```

### Android dev build

```bash
npm run android
```

### Start Metro in dev client mode

Use this after the native build is installed:

```bash
npm run dev
```

This gives:

* fast refresh
* sandbox routes
* debug tools

---

## Storybook / UI Sandbox

Ntsiniz includes full Storybook + screen sandbox for fast UI development.

---

### Run Storybook (cross-platform)

```bash
npm run storybook
```

### Run Storybook on iOS

```bash
npm run storybook:ios
```

### Run Storybook on Android

```bash
npm run storybook:android
```

---

### Storybook Includes

#### Shared UI Components

* AppText / headings / body text
* Buttons
* Inputs
* Cards
* Bottom sheets
* Banners
* Modals

#### Ntsiniz-specific UI

* Mic permission UI
* Drill controls
* Pitch indicators
* Vocal range ladder
* Session summary cards
* Waveform visualizers

#### Full Screen Flows

* Welcome / splash
* Onboarding level select
* Mic setup
* Range finder
* Singing drill
* Playback
* Session summary

---

## UI Sandbox Workflow

For rapid iteration:

### Main dev lane

```bash
npm run dev
```

Use:

* full app navigation
* QA tools
* real flows

### Storybook lane

```bash
npm run storybook
```

Use:

* isolated components
* screen previews
* design testing

### Sandbox access inside app

Go to:

**Settings → QA → Open UI Sandbox**

Available:

* Sandbox Hub
* Component Playground
* Flow Playground
* Storybook Screen

---

## Common Development Commands

### Type check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Run all tests

```bash
npm test
```

### Fast CI verification

```bash
npm run ci
```

### Full release checks

```bash
npm run ci:release
```

---

## E2E Testing

### Maestro

```bash
npm run e2e:maestro
```

### Killer loop smoke flow

```bash
npm run e2e:killer-loop
```

### Detox iOS

Build:

```bash
npm run e2e:detox:build:ios
```

Test:

```bash
npm run e2e:detox:test:ios
```

### Detox Android

Build:

```bash
npm run e2e:detox:build:android
```

Test:

```bash
npm run e2e:detox:test:android
```

---

## Performance / Quality

### Performance budget

```bash
npm run perf:budget
```

### Capture perf evidence

```bash
npm run perf:capture
```

### QA release evidence

```bash
npm run evidence:capture
```

---

## Native / Build Utilities

### Prebuild native folders

```bash
npm run prebuild
```

### Build safety check

```bash
npm run build:check
```

### Verify audio / config rules

```bash
npm run check:audio-mode
npm run check:config
npm run check:remote-config
```

---

## First-Time Smoke Test

After app launches:

1. Allow microphone access
2. Start onboarding
3. Complete first drill
4. Check live pitch feedback
5. Record short take
6. Play back saved take
7. Confirm UI / audio loop works

---

## Troubleshooting

### Metro stale bundle

```bash
npx expo start -c
```

### Watchman issues

```bash
watchman watch-del "$PWD"
watchman watch-project "$PWD"
```

### Expo package mismatch

```bash
npx expo doctor
```

To fix package versions:

```bash
npx expo install <package>
```

### Android emulator storage issue

```bash
adb -s emulator-5554 shell df -h /data
adb -s emulator-5554 uninstall com.ntsiniz.app
npm run android
```

---

## Project Structure

```bash
src/
  app/          # app routes / screens
  core/         # audio engine / scoring / telemetry
  ui/           # shared UI / components / drill UI
  theme/        # tokens / neumorphism system

modules/        # local native modules
scripts/        # CI / QA scripts
docs/           # product / release docs
storybook/      # stories / config
```
