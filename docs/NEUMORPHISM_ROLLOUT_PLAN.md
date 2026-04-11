# Ntsiniz Neumorphism Rollout Plan (Production)

## Objectives
- Deliver a tactile, neumorphic look that still meets mobile usability and accessibility standards.
- Keep all visual changes token-driven so updates propagate through Storybook, sandbox, and production screens.
- Support two rendering qualities:
  - `full` for modern devices.
  - `lite` for lower-end devices to reduce layered shadow cost.

## Visual Principles (Mobile-Adapted)
- Use subtle depth; avoid extreme blur and long-offset shadows that reduce legibility.
- Prefer semantic surface variants over ad-hoc styling:
  - `flat`, `raised`, `inset`, `pressed`, `glass`.
- Use color + depth + border as a combined system. Depth alone is never used to communicate state.
- Keep key actions explicit with high-contrast text on action surfaces.

## Token and Theme Strategy
- Canonical tokens live in `src/theme/tokens/*`.
- Neumorphism rules and helpers live in:
  - `src/theme/neumorphism/rules.ts`
  - `src/theme/neumorphism/style.ts`
- Required semantic token groups:
  - spacing, radius, typography, colors, motion, breakpoints, elevation, shadows.
- Add and maintain high-contrast safety colors:
  - `highContrastText`, `highContrastIcon`.

## Light/Dark Compatibility
- Maintain separate dark/light palettes with semantic parity (same token names, mode-specific values).
- Enforce readable contrast for:
  - text vs surface,
  - icons vs controls,
  - focus/active borders vs background.
- Validate both modes via Storybook global toolbar (`themeMode`) and UI tests.

## Elevation and State Rules
- Primary depth states:
  - `default` for resting surfaces,
  - `pressed` for interactions,
  - `disabled` for unavailable actions.
- Use `getNeumorphicSurfaceStyle` as the only elevation resolver for new shared components.
- Keep interaction states explicit in stories (loading/error/disabled/pressed matrix).

## Component Rollout Order
1. Foundation atoms and molecules:
   - text primitives, buttons, text input, cards, status banners.
2. Interaction shells:
   - modal and bottom-sheet wrappers.
3. Organisms:
   - drill controls, playback controls, summary blocks, chart panels.
4. Full screens:
   - welcome, level selection, mic permission, range finder, drill, playback, summary/win.

## Accessibility Guardrails
- Preserve readable font sizes and line-heights from shared typography tokens.
- Do not encode critical meaning with color alone; pair with labels and iconography.
- Keep disabled states visible and distinguishable from background.
- Keep reduced-motion support enabled via theme controls and Storybook globals.

## Performance Strategy
- Use `SurfaceQuality`:
  - `full`: full shadow radius/opacities for capable devices.
  - `lite`: capped radius/opacities/elevation while preserving layout and spacing.
- Avoid stacking many large blur/shadow layers in scrolling lists.
- Prefer shared wrappers over repeated inline styles to reduce churn and regression risk.

## Storybook and Sandbox Gate
- Storybook remains dev-only behind:
  - `EXPO_PUBLIC_STORYBOOK_ENABLED`
  - `EXPO_PUBLIC_STORYBOOK_ROOT`
- Sandbox routes are dev-only surfaces and excluded from store builds by surface policy tests.

## Figma Workflow (Pull-Only)
- Keep token sync manual and reviewed:
  - `scripts/import-figma-tokens.mjs` for import snapshot flow.
- Never auto-overwrite runtime components from Figma.
- Promote token changes only after Storybook + sandbox verification.

## Release Checklist
1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:ui`
4. `npm run sandbox:smoke`
5. Validate required screen stories on device in Storybook.
6. Validate dev-only gating remains intact for production builds.

