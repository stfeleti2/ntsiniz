# Ntsiniz — Audio‑First Singing Coach (Expo + React Native)

## Node & npm version (important)

Expo tooling is most reliable on **Node 20.x** (per Expo SDK docs). I **recommend** Node 20 for CI and release builds.

That said, this repo is configured to **allow newer Node (e.g. Node 24)** so `npm ci` doesn’t hard-fail.
If I see Metro / CocoaPods / Gradle weirdness on Node 24, switch the project to Node 20 using Volta:

```bash
curl https://get.volta.sh | bash
# restart your terminal
volta pin node@20.19.0 npm@10.2.4
```


This repository is a **single-root** Expo app (the old duplicate `/work` tree is gone).

It ships the core loop:
**Choose drill → reference audio → record → live feedback → playback/waveform → save best take → proof → next action.**

## UI note (important)
I do **not** rely on any external “Ntsiniz UI kit”. The UI layer is a small in-repo design system under:

- `src/ui/primitives` (Box/Text/Stack/Pressable/Surface…)
- `src/ui/components` (Button/Card/Screen/ProgressBar…)
- `src/ui/patterns` (RecordingOverlay/WaveformCard/PlaybackOverlay…)

If I want to restyle the product, I edit tokens + primitives once and the whole app updates.

---

## Requirements

- **Node 20.x** (see `.nvmrc`)
- **npm 10.x**
- Xcode (iOS) and/or Android Studio (Android)

> This repo enforces engines via `.npmrc` (`engine-strict=true`). If Node/npm don’t match, installs will fail.

---

## Install (deterministic)

```bash
npm ci
```

### If I need to change dependencies

```bash
npm install
```

(Commit the updated `package-lock.json`.)

---

## Run

### 1) Start Metro (JS dev)

```bash
npm run start
```

### 2) Build a dev client (required)
This app uses native modules (e.g. realtime mic PCM streaming). **Expo Go is not enough**.

iOS:
```bash
npm run ios
```

Android:
```bash
npm run android
```

If I need native folders generated first:
```bash
npm run prebuild
```

---

## Common scripts

### Quality / CI

Fast local verification (what PR CI runs):
```bash
npm run ci
# same as: npm run ci:fast
```

Release-only gates (docs/evidence checks):
```bash
npm run ci:release
```

### Typecheck
```bash
npm run typecheck
```

### Tests
Core + UI tests:
```bash
npm test
```

### Content tooling
Generate + validate packs/manifests:
```bash
npm run gen:content-index
npm run gen:content-manifest
npm run sign:content-manifest
npm run check:content-manifest
npm run check:content-signature
npm run pack:doctor
```

### Evidence capture (device / perf)
```bash
npm run perf:capture
npm run evidence:capture
```

---

## E2E (optional)

### Maestro
Maestro is a **separate CLI** (not an npm dependency).

- Install Maestro (macOS):
  - `brew install maestro`

Run:
```bash
npm run e2e:maestro
# or CI-style junit artifacts:
npm run e2e:maestro:ci
```

### Detox
Detox is installed as an npm devDependency, but requires extra platform setup (AppleSimUtils, Android emulator tooling).

Build + run:
```bash
npm run e2e:detox:build:ios
npm run e2e:detox:test:ios

npm run e2e:detox:build:android
npm run e2e:detox:test:android
```

---

## Troubleshooting

### "Some dependencies don’t exist" / installs fail on another machine
This repo’s lockfile is intended to work with the public npm registry.

If I ever see lockfile URLs pointing to an internal registry, regenerate:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Expo version mismatches
Run:
```bash
npx expo doctor
```

If Expo suggests a specific version, prefer:
```bash
npx expo install <package>
```

---

## Repo map

- `src/core` — engine, audio pipeline, scoring, DB, remote config, telemetry
- `src/ui` — primitives/components/patterns + tokens
- `src/screens` — product screens
- `content/` — drill packs and curriculum
- `modules/` — local native modules (`file:` deps)
- `scripts/` — CI/pack doctor/evidence tooling
- `docs/` — release, store, privacy/compliance
