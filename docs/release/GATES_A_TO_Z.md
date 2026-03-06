# Gates A → Z (pre-launch hardening)

This is the **single checklist** we use to move from MVP → production-grade.

Legend: ✅ done · 🟡 in progress · ⛔ missing

## Gate A — Deterministic builds
- ⛔ **Commit `package-lock.json`** and switch all CI installs to `npm ci`.
  - Why: prevents surprise regressions near launch.
  - Enforced by: `scripts/check-lockfile.sh`.

## Gate B — Repo/build truth
- ✅ Repo includes `src/**`, configs, scripts, docs.
- ✅ App init is syntactically correct and ordered.

## Gate C — Privacy truth alignment
- ✅ `docs/privacy/DATA_MAP.md` is complete and contains no TODO/TBD/FIXME markers.
  - Enforced by: `scripts/check-privacy-docs.sh` + `privacyDocs.test.ts`.
- 🟡 Store forms must match DATA_MAP (manual verification).

## Gate D — Consent-gated telemetry
- ✅ Crash reporting default is **OFF until user opts in**.
- ✅ Single init path via `initTelemetryGate()`.
- 🟡 Add a “telemetry choice” event (local only) for support debugging.

## Gate E — Store build surface
- ✅ Store build excludes camera/media plugins and permissions.
- ✅ Store build hides unfinished Phase 2+ surfaces.

## Gate F — Performance budgets
- ✅ Bundle size budget enforced (`scripts/perf-budget.mjs`).
- ✅ Dev JS-stall monitor with p95/last/worst.
- ✅ FrameBus queue pressure reported in dev overlay.
- 🟡 Low-end device validation run recorded (manual).

## Gate G — Audio loop safety
- ✅ Native callback does push-only; heavy work is drained in JS.
- 🟡 Add underrun/drop counters from native driver (when available).

## Gate H — Explainable scoring
- ✅ Every attempt produces a `ScoreReport` breakdown.

## Gate I — i18n enforcement
- ✅ CI fails on hardcoded `<Text>` nodes outside i18n.

## Gate J — Release QA matrix
- 🟡 Run `docs/QA_CHECKLIST.md` + `docs/qa/DEVICE_MATRIX.md` on real devices.

## Gates K → Z (reserved)
We keep the remaining letters for upcoming launch needs (support tooling, growth loops,
video phase, curriculum depth, etc.) so the gate list never gets renumbered.

## Definition of Done (pre-launch)
- You cannot ship until **Gate A** and **Gate J** are ✅.
