# Figma to UI Mapping (Pull-Only)

This project uses a pull-only design sync strategy:

- Figma is a reference source for component intent and token naming.
- Code remains the source of truth for runtime behavior and final implementation.
- No tool is allowed to overwrite production UI files automatically.

## Component naming contract

Use these naming pairs when mapping in Figma Dev Mode or Code Connect:

- `Button/Primary` -> `src/ui/components/kit/Button.tsx`
- `Input/Default` -> `src/ui/components/kit/Input.tsx`
- `Card/Surface` -> `src/ui/components/Card.tsx`
- `Screen/Shell` -> `src/ui/components/Screen.tsx`

## Token naming contract

- Color tokens map to `src/ui/tokens/colors.ts`
- Spacing tokens map to `src/ui/tokens/spacing.ts`
- Radius tokens map to `src/ui/tokens/radius.ts`
- Motion tokens map to `src/ui/tokens/motion.ts`
- Breakpoint tokens map to `src/ui/tokens/breakpoints.ts`

## Importing Figma token snapshots

You can import exported Figma token JSON without touching runtime token files:

```bash
npm run tokens:import:figma -- ./tmp/figma-tokens.json
```

This writes a snapshot to:

- `src/ui/tokens/figma.generated.ts`

Then manually compare the snapshot against runtime tokens before applying changes.
