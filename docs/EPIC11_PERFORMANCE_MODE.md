# EPIC 11 — Performance Mode (video clips)

This repo now includes an **offline-first Performance Mode** for recording short vertical clips.

## What it does
- Records a **vertical MP4** using the device camera + mic.
- Shows a **live pitch gauge + live score** during recording.
- Saves the clip into the app’s private documents folder (`documentDirectory/clips`).
- Generates a **thumbnail** (best-effort) using `expo-video-thumbnails`.
- Provides:
  - **Share video** (system share sheet)
  - **Save to gallery** (Media Library)
  - **Share cover image** (watermark + score as a Story-friendly slide)
  - **Post to Community** (offline-first post referencing the local clip)

## Key files
- `src/app/screens/PerformanceModeScreen.tsx`
- `src/app/screens/PerformancePreviewScreen.tsx`
- `src/core/performance/*`
- `src/core/storage/db.ts` (adds `clips` table)

## Install deps
Run these in your local repo:

```bash
npx expo install expo-camera expo-media-library expo-video-thumbnails
```

## Permissions
- iOS: camera + mic + photo library add
- Android: camera + mic + media read/write (handled via `app.config.ts`)

## Important limitation (by design for managed Expo)
The exported MP4 is the raw camera recording. **React Native UI overlays are not “burned into” the MP4** in managed workflow.

To still get a clean “viral” asset, we also export a **cover image** (thumbnail + watermark + score) which is perfect for Stories.

If you want **overlay baked into the video**, you’ll need a native video pipeline (e.g. dev client + FFmpeg/GL render). That can be a follow-up EPIC.
