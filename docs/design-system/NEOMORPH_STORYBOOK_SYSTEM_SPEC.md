# Neomorphism Design-System Refactor Spec

## System Goal
Storybook is the single UI source of truth for web and mobile, with one token-driven neomorphism layer and zero platform-specific style duplication.

## 1. Design-System Refactor Plan

### 1.1 Token System
The canonical token layer is `src/theme/tokens` and `src/theme/neumorphism`.

Token domains:
- Colors: `src/theme/tokens/colors.ts`
- Spacing: `src/theme/tokens/spacing.ts`
- Radius: `src/theme/tokens/radius.ts`
- Elevation and shadow depth: `src/theme/tokens/elevation.ts`, `src/theme/tokens/shadows.ts`
- Neomorphism rules: `src/theme/neumorphism/rules.ts`, `src/theme/neumorphism/dualShadow.ts`, `src/theme/neumorphism/style.ts`

Hard constraints encoded in this plan:
- Dark background is immutable: `darkColors.bg` remains `#070911`
- Dual-light neomorphism shadows are mandatory for raised/glass surfaces
- Insets and pressed states use tokenized inner highlight + shadow behavior
- No hard borders outside tokenized borderAlpha/borderStrong usage

### 1.2 Component Hierarchy
Single hierarchy (platform-agnostic):
1. Tokens: `src/theme/tokens/**`
2. Neomorphism rules and helpers: `src/theme/neumorphism/**`
3. Primitives: `src/ui/primitives/**`
4. Composed components: `src/ui/components/**`
5. Screens: `src/app/screens/**`
6. Stories (system authority): `src/storybook/stories/**` and `src/ui/components/**.stories.tsx`

### 1.3 Primitive Breakdown
Required primitives baseline:
- Layout primitives: `Box`, `Stack`, `Spacer`, `Divider`
- Typography primitive: `Text`
- Interaction primitives: `Pressable`, `SurfacePressable`
- Surface primitives: `Surface`, `SurfacePanel`, `SurfaceView`
- Input primitives: `Input`, `Button`, `Card`

Rules:
- No `Neo*` or variant-suffixed component naming in public APIs
- No component-level inline color constants that bypass theme tokens
- All visual depth must resolve via neumorphism/elevation token layer

## 2. Storybook Expansion Map

The deterministic audit artifacts are generated from source code by:
- `node scripts/audit-design-system.mjs`

Generated files:
- Coverage report JSON: `docs/design-system/storybook_coverage_report.json`
- Expansion map + state matrix: `docs/design-system/storybook_expansion_map.md`

Current baseline snapshot:
- Components covered: 11/31
- Primitives covered: 6/14
- Screens covered: 4/83
- Story files: 29

Coverage rule:
- Any UI element without Storybook representation is non-compliant

State rule for every story file:
- Required states: `default`, `loading`, `disabled`, `error`, `empty`, `success`

Governance commands:
- Generate map: `npm run design-system:audit`
- Enforce contract (fails on gaps): `npm run check:design-system`

## 3. Refactored Architecture Proposal

### 3.1 Shared UI Package Structure
Repository-local package layout (single shared layer):
- `src/theme/**` for tokens and neumorphism rules
- `src/ui/primitives/**` for token-resolved primitives
- `src/ui/components/**` for composed reusable components
- `src/app/screens/**` for feature screens built only from shared components
- `src/storybook/**` + `.storybook/**` for authoritative visual and behavioral definitions

No duplicated per-platform style trees are allowed.

### 3.2 Platform Integration Model
Source of truth flow:
- Storybook web: `.storybook/main.ts` + `.storybook/vite.config.ts`
- Storybook mobile: `.rnstorybook/**`
- Shared preview/decorator contract: `src/storybook/preview.tsx`, `src/storybook/decorators.tsx`

Sync invariant:
- Storybook stories import from shared `src/ui` and `src/theme` layers only
- Mobile and web consume same primitive/component codepaths
- Platform-specific modules are mocked at Storybook boundary, not inside design-system primitives

### 3.3 Theme Injection Strategy
Provider entrypoint:
- `src/theme/provider/ThemeProvider.tsx`

Injection requirements:
- Global provider wraps all Storybook stories
- Mode toggles (`dark`, `light`, `system`) drive token mode resolution
- Motion and reduced-motion controls are global and story-consistent
- Background presets are token-compatible and previewable

## 4. Deterministic Migration Order

1. Make strict audit pass for primitives and core components first
2. Add/normalize story states across existing story files
3. Register all app screens in Storybook screen stories
4. Remove or refactor any orphan UI not represented in Storybook
5. Enable strict audit in CI gate once coverage reaches full compliance

## 5. Compliance Status

Current status:
- Governance tooling: implemented
- Coverage artifacts: generated
- Strict enforcement: active via `npm run check:design-system` and currently failing (expected until migration completion)

Definition of done:
- `npm run check:design-system` exits 0
- No missing components/primitives/screens in Storybook map
- Every story file satisfies required state matrix
- No token bypasses and no duplicate component systems
