# Perf “Gold Target” Proof (Static)

This document is **auto-generated** from the source-of-truth thresholds in:

- `src/core/perf/qualityHeuristics.ts`

Generated at: **2026-02-26T19:02:07.539Z**

## What this proves

✅ The **gold/floor budgets** used by the adaptive Quality Mode system are *actually present in code*.

🟡 Real-device smoothness still requires running the **profiling steps** in `docs/qa/PERF_QUALITY_MODES.md` and collecting logs.

## Gold targets (premium feel)

`
{
  "HIGH": {
    "p95": 160,
    "worst": 800
  },
  "BALANCED": {
    "p95": 220,
    "worst": 900
  }
}
`

## Floor targets (still supported)

`
{
  "LITE": {
    "p95": 450,
    "worst": 1100
  }
}
`

## Next: runtime proof

1. Enable Dev Perf Overlay in-app.
2. Run a 2-minute drill per tier device.
3. Export perf snapshots (instructions in `docs/qa/PERF_QUALITY_MODES.md`).
4. Attach the JSON logs to the release PR.
