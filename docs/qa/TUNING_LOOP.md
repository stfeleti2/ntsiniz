# Threshold / hysteresis tuning loop

Goal: scoring feels **fair** and repeatable.

## KPIs
- Same take analyzed 10x: variance is tiny (min/max close)
- Sustained note: low note-flip rate (stable)
- Noisy environment: confidence banner appears and prevents unfair penalties

## Workflow
1) Record a representative attempt (quiet room).
2) Use Dev → Repeatability to re-analyze 10x and record stats.
3) Adjust:
   - confidence threshold
   - smoothing window
   - hysteresis for note transitions
4) Repeat until stable.
5) Repeat in noisy room:
   - ensure confidence banner triggers
   - ensure feedback is helpful, not punishing

## Rule
Tune based on repeatability metrics + real device recordings, not vibes.
