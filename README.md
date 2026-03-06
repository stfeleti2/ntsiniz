# Ntsiniz

Ntsiniz is an audio-first singing coach app built with Expo and React Native.

This repo contains the mobile app and local native modules used for real-time audio features.

## What the app does

Ntsiniz helps users practice singing with a simple loop:

1. Choose a drill.
2. Listen to a reference.
3. Record your voice.
4. Get live feedback.
5. Replay and review.
6. Save your best take.

## For people browsing on GitHub

- This is an active app codebase, not a demo project.
- The app uses native modules, so Expo Go is not enough.
- You need a development build (`npm run ios` or `npm run android`).

## Prerequisites

- Node.js `>=20.19.0 <25`
- npm `>=10`
- Git
- For iOS: Xcode
- For Android: Android Studio + SDK + emulator

Notes:

- The repo uses `engine-strict=true`, so wrong Node/npm versions will fail install.
- If you use `nvm`, run `nvm use` in the project root.

## Setup

1. Install dependencies:

```bash
npm ci
```

2. Optional: create local env values:

```bash
cp .env.example .env
```

Fill in only the values you need (for example Sentry or RevenueCat).

## Run the app

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Clean build (if needed)

```bash
npm run ios -c
npm run android -c
```

## First-time app use (manual smoke test)

After the app opens:

1. Allow microphone permission.
2. Start a drill from the home screen.
3. Confirm you can hear reference audio.
4. Record a short take.
5. Confirm feedback and playback work.

## Useful scripts

Run CI checks locally:

```bash
npm run ci
```

Typecheck only:

```bash
npm run typecheck
```

Tests:

```bash
npm test
```

Regenerate native folders (rare):

```bash
npm run prebuild
```

## Troubleshooting

### Install fails because of Node/npm version

Check versions:

```bash
node -v
npm -v
```

Then switch to a supported Node version (for example with `nvm use`).

### Android install fails with "not enough space"

Free emulator storage, then retry:

```bash
adb -s emulator-5554 shell df -h /data
adb -s emulator-5554 uninstall com.ntsiniz.app
npm run android -c
```

### Watchman recrawl warning

```bash
watchman watch-del "$PWD"
watchman watch-project "$PWD"
```

### Metro cache issues or stale bundle

```bash
npx expo start -c
```

### Expo dependency mismatch

```bash
npx expo doctor
```

If doctor suggests package versions, prefer:

```bash
npx expo install <package>
```

## Project structure

- `src/core` - audio, scoring, state, telemetry
- `src/ui` - UI primitives, components, modules
- `src/app` - app routes and screens
- `modules` - local native modules
- `scripts` - CI and maintenance scripts
- `docs` - product and release docs
