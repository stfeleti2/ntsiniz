# Ntsiniz Full Production Curriculum + Scoring Engine Pack

This pack includes:

- `curriculum_full_production.json` — full app-ready curriculum dataset
- `drills_flat.csv`, `lessons_flat.csv`, `stages_flat.csv` — spreadsheet-friendly exports
- `scoring_engine_spec.json` — formulas, fairness rules, pitch math, and result schema
- `pitch_math.ts` — exact Hz → MIDI → cents helpers
- `scoring_engine.ts` — React Native friendly scoring starter
- `adaptive_engine.ts` — adaptive engine pseudocode + reducer logic

## Package stats

- Stages: 5
- Lessons: 30
- Drills: 180
- Assessments: 5
- Routes: 5

## Notes

- The curriculum uses JSON as source of truth because it supports hierarchy, prerequisites, branching, and metadata cleanly.
- The CSV files are flattened operational exports.
- The adaptive engine is reducer-based so it can fit naturally into React Native state management.

## Recommended integration order

1. Load `curriculum_full_production.json`
2. Implement `pitch_math.ts`
3. Wire drill-family configs to `scoring_engine.ts`
4. Connect post-attempt result objects into `adaptive_engine.ts`
5. Persist diagnosis tags and rolling metrics for personalization