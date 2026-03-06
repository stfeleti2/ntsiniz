# Performance budget (tiered, premium)

We are a **premium product**. We keep visual fidelity high on capable devices and use **adaptive degradation** (Quality Mode) to stay disciplined.

Target mix:

* **50% mid-range**
* **40% high-end**
* **10% low-end** (supported; effects adapt down)

See: `docs/qa/PERF_QUALITY_MODES.md`

## Targets

### Gold (HIGH/BALANCED)

* **Drills:** 60fps target (smooth recording + overlay).
* **JS stalls:**
  * HIGH: p95 ≤ **160ms**
  * BALANCED: p95 ≤ **220ms**
* **Audio:** FrameBus drops = **0** for typical drills.

### Floor (LITE)

* Usable + stable; effects degrade.
* JS stall p95 ≤ **450ms**.
- **Audio:** recording should not underrun; analysis should not block UI.
- **Battery:** no background polling loops; refresh only on focus or manual.

## What to measure
- Drill start → first pitch detection latency
- Overlay smoothness while singing
- **FrameBus pressure:** queue depth + dropped frames (must not grow unbounded)
- Navigation responsiveness during/after drill
- Playback seek smoothness

## Tools (in-repo)
- Settings → Dev → Perf overlay (JS stall detector)
- Dev → Repeatability screen (score variance proof)

Quality Mode:

- Settings → Quality mode
- Dev perf overlay shows current tier/mode

## “Fail fast” rules

If performance drops:

* Prefer reducing *effects* via **AUTO → LITE** (do not reduce typography/spacing/layout).
* Reduce waveform density and animation intensity before removing features.
