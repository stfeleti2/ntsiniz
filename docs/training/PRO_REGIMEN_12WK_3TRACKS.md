# Pro Training Regiment v2 — 12 Weeks + 3 Tracks

This curriculum is designed to strengthen Ntsiniz’ **killer loop**:
**Choose day → Record (live feedback) → Playback (waveform/seek) → Save best take → Progress moment → What next.**

## Tracks

- **Beginner**: widest tolerance, more real-time guidance, more repetition.
- **Intermediate**: more transitions + melody earlier, feedback fades sooner.
- **Advanced**: faster progression, more transfer (overlay fades/off), agility + phrase work.

## Structure

- **12 weeks** × **7 days** (84 lessons per track)
- Day 7 is a **recovery + transfer** day (light practice, protects the voice, keeps the habit).

## Content files

Lessons (long-form coaching text per day):
- `src/content/lessons/pro_regimen12_beginner.*.json`
- `src/content/lessons/pro_regimen12_intermediate.*.json`
- `src/content/lessons/pro_regimen12_advanced.*.json`

Curriculum (day list + drillIds):
- `src/content/curriculum/pro_regimen12_beginner.*.json`
- `src/content/curriculum/pro_regimen12_intermediate.*.json`
- `src/content/curriculum/pro_regimen12_advanced.*.json`

## App wiring

- Settings → Training program:
  - `Phase 1 (Foundations)`
  - `Pro regimen (8 weeks)`
  - `Pro regimen (12 weeks)`
- When `Pro regimen (12 weeks)` is active, a **Track** selector appears:
  - Beginner / Intermediate / Advanced

Settings persistence:
- `activeCurriculum: 'phase1' | 'pro_regimen' | 'pro_regimen12'`
- `activeTrack: 'beginner' | 'intermediate' | 'advanced'`

## Verification

After adding or editing content packs, regenerate the manifest/signature and run CI:

```bash
npm install
npm run gen:content-manifest
npm run sign:content-manifest
npm run ci
```


## Track-specific coaching rules (runtime)

✅ Track selection now changes **overlay + scoring strictness** at runtime.

**Where implemented:**
- `src/core/coaching/feedbackPolicy.ts` (progressive rules)
- `src/app/screens/SessionScreen.tsx` (stores track/week + lesson base plan)
- `src/app/screens/DrillScreen.tsx` (resolves plan per drill segment; applies tuneWindowCents + overlay visibility)

**Behavior:**
- Beginner: wider cents tolerance, more realtime help.
- Intermediate: BANDWIDTH_ONLY early; transitions to FADED from week 7.
- Advanced: FADED early (shorter fade each week), BANDWIDTH_ONLY from week 5; weeks 9–12 enforce **OFF_POST only on transfer drills** (phrases/melodies/performance) to build independence.
