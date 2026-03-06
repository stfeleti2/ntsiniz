# Perf & Quality Modes (Premium Targeting)

We optimize for a **premium feel** on capable devices while staying disciplined on CPU/memory/network.

## Target distribution (non-negotiable)

* **50% mid-range** (default experience)
* **40% high-end** (full fidelity)
* **10% low-end** (supported; effects adapt down, UX remains usable)

## Quality modes

Quality mode is **AUTO by default** and can be overridden in **Settings → Quality mode**.

Modes:

* **HIGH** – full fidelity effects
* **BALANCED** – premium default for most devices
* **LITE** – reduces effect intensity/density when perf drops
* **AUTO** – chooses initial mode by device tier and adapts at runtime

Implementation:

* Source of truth: `src/core/perf/qualityRuntime.ts`
* Heuristics + thresholds: `src/core/perf/qualityHeuristics.ts`

## What changes per mode

| Subsystem | HIGH | BALANCED | LITE |
|---|---:|---:|---:|
| Animation intensity (scale) | 1.00 | 0.90 | 0.65 |
| Shadow scale | 1.00 | 0.85 | 0.60 |
| Blur | On | On | Off |
| Waveform bars | 180 | 140 | 90 |
| Background work interval | 20s | 30s | 45s |

Premium guardrail: **Typography, spacing, layout hierarchy never degrade**. Only *effect intensity* changes.

## Gold vs Floor budgets

### Gold (HIGH + BALANCED)

* **JS stall p95**: ≤ **160ms** (HIGH), ≤ **220ms** (BALANCED)
* **Worst JS stall**: ≤ **800–900ms** during drills
* **Audio pressure**: FrameBus dropped frames = **0** for typical sessions
* **Waveform**: smooth seek + no visible hitches

### Floor (LITE)

* **JS stall p95**: ≤ **450ms**
* **Worst JS stall**: ≤ **1100ms**
* **Audio pressure**: drops should not accumulate; UI remains responsive

## Runtime adaptation thresholds

AUTO uses runtime perf signals to degrade/upgrade **effects**:

Degrade triggers (any):

* FrameBus drops > 0
* p95 stalls exceed mode threshold (see `shouldDegrade()`)
* worst stall exceeds mode threshold

Upgrade triggers:

* stable p95 ≤ threshold for 2 minutes (anti-flap)
* no FrameBus drops

## Instrumentation

* JS stalls: `src/core/perf/perfMonitor.ts`
* Quality state: `subscribeQuality()` (`src/core/perf/qualityRuntime.ts`)
* Dev overlay shows tier/mode: `src/app/components/DevPerfOverlay.tsx`

## Profiling steps (required before launch)

1. Enable dev perf overlay.
2. Run a 90s drill + 90s playback seek loop.
3. Record:
   * p95 stalls, worst stalls
   * FrameBus queue + dropped frames
   * current quality mode

## Export + analyze logs (gold proof)

This repo includes:

* `docs/qa/sample_perf_log_high.json` (example input)
* `docs/qa/sample_perf_log_high_report.json` (example output)
* `scripts/analyze-perf-log.mjs` (verifies logs against budgets)

To analyze a real device log you export from the app (JSON):

```bash
node scripts/analyze-perf-log.mjs path/to/your_perf_log.json
```

If it exits with code 0 → the device/mode run **meets** the Gold/Floor budget.
