# Ghost Guide Overlay (Aurora Highway)

This repo ships a Ghost Guide overlay implemented with **react-native-svg** + **Reanimated** so it works out-of-the-box.

## Why SVG-first

- No additional native dependency.
- Still supports the core “Guitar Hero” feel: fixed playhead + scrolling target bars + instant hit feedback.

## Optional upgrade: Skia

If you want true GPU glow/blur and richer trails, switch the renderer to **@shopify/react-native-skia**.

Expo supports Skia directly (install via `npx expo install @shopify/react-native-skia`).

References:
- Expo Skia docs: https://docs.expo.dev/versions/latest/sdk/skia/
- Skia + Reanimated integration: https://shopify.github.io/react-native-skia/docs/animations/animations/

## Where it is wired

- **Drills**: `DrillScreen` → `RecordingOverlay` children → `GhostGuideOverlay`
- **Performance Mode**: `PerformanceModeScreen` overlays `GhostGuideOverlay` on the camera preview

## Data contracts

- Drills stream `onGhostFrame` telemetry from `runDrillWithDrivers()` via the app runner registry.
- Performance mode uses a small template-based plan in `src/core/performance/ghostPlans.ts`.
