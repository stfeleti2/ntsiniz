# Pro Training Regiment v1 (8 weeks)

This pack is **data-driven** and plugs into the killer loop:

Open → Choose drill → Record (live feedback) → Playback (waveform/seek) → Save Best Take → Progress moment → What next

## Content files

- Lessons (coaching copy):
  - `src/content/lessons/pro_regimen.en.json`
  - `src/content/lessons/pro_regimen.zu.json` (English fallback copy for now)
  - `src/content/lessons/pro_regimen.xh.json` (English fallback copy for now)

- Curriculum (day plan → drill IDs):
  - `src/content/curriculum/pro_regimen.en.json`
  - `src/content/curriculum/pro_regimen.zu.json`
  - `src/content/curriculum/pro_regimen.xh.json`

## How it works

- Each day references a `lessonId` and an ordered list of `drillIds`.
- The app loads the active curriculum via `Settings.activeCurriculum`:
  - `phase1` (default)
  - `pro_regimen`

## Shipping notes

If your repo uses content-manifest integrity checks:
- Run:
  - `npm run gen:content-manifest`
  - (and `npm run sign:content-manifest` if enabled)
- Commit the updated manifest artifacts.
