# UI Workflow (Ntsiniz)

## Fast Lanes
- Storybook lane:
  - `npm run storybook`
  - `npm run storybook:ios`
  - `npm run storybook:android`
- App sandbox lane:
  - `npm run dev`
  - Navigate to `SandboxHub` in dev builds.

## Dev-Only Gating
- Storybook bundling is enabled only when `EXPO_PUBLIC_STORYBOOK_ENABLED=true`.
- Storybook root rendering is enabled only when `EXPO_PUBLIC_STORYBOOK_ROOT=true`.
- Sandbox and Storybook routes are exposed only when `dev` surface flag is on.

## Canonical UI Paths
- Shared UI components:
  - `src/components/ui/atoms`
  - `src/components/ui/molecules`
  - `src/components/ui/organisms`
- Screen previews:
  - `src/screens/previews`
- Theme and tokens:
  - `src/theme/tokens`
  - `src/theme/provider`
  - `src/theme/neumorphism`
- Storybook:
  - `src/storybook`
  - `src/storybook/stories`

## Required Validation
1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:ui`
4. `npm run sandbox:smoke`

