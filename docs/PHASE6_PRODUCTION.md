# Phase 6 — MVP → Production Product

This phase is about **perfecting what exists**: removing stubs, closing loose ends, tightening reliability, and making the product feel "finished".

## Definition of Done (Phase 6)

### 1) No user-facing stubs
- No UI text containing `TODO:` / `FIXME:`
- No placeholder URLs (share cards / invites / privacy / terms)
- No dev-only toggles visible in production builds

### 2) Quality gates are enforced
- Lint, typecheck, tests
- Quality gate script passes locally and in CI

### 3) Product feels coherent
- One clear "What now?" on Home
- Share payloads look intentional
- Invites always work (offline-first) and don’t expose placeholders

### 4) Store-grade compliance basics
- Privacy/Terms available as real URLs
- Permission prompts have a primer

## What we implemented in this repo

- Public link configuration via `extra`:
  - `publicAppUrl`
  - `publicInviteUrlBase`
- Removed UI placeholder footers and deep-link placeholders.
- Added a CI-friendly quality gate:
  - `scripts/check-no-ui-todos.sh`
  - `scripts/quality-gate.sh`
  - `npm run quality:gate`

## TODO (Ops) before launch

- Set real values in EAS/CI env:
  - `PUBLIC_APP_URL`
  - `PUBLIC_INVITE_URL_BASE`
  - `PRIVACY_URL`
  - `TERMS_URL`
- Translate `zu` and `xh` strings (currently English fallback).
- Decide child/minor policy and fill in legal doc TODOs.
