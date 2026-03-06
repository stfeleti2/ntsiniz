# Module boundaries (Gate 2)

We keep the codebase **fast, testable, and low-bloat** by enforcing strict boundaries.

## Rules

### `src/core/**`

* Pure product logic (audio pipeline, scoring, storage, cloud sync, trust).
* Must be **UI-agnostic**.
* **MUST NOT** import from `src/app/**`.

### `src/app/**`

* UI + navigation + screens.
* May import from `src/core/**`.

## Enforcement

* `scripts/check-boundaries.mjs` runs in `scripts/quality-gate.sh` and fails CI if core imports app.
