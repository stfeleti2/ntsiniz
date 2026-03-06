# Remote rollbacks (kill-switch) ✅

This repo supports server-driven rollback of specific content IDs without shipping a new app build.

## Status
- ✅ Packs: `killSwitch.disabledPackIds`
- ✅ Drills: `killSwitch.disabledDrillIds`
- ✅ Lessons: `killSwitch.disabledLessonIds`
- ✅ Competitions: `killSwitch.disabledCompetitionIds`

## Behavior
- **Development (`__DEV__`)**: disabled IDs are still shown/loaded but logged as `*_disabled` so you can test the rollout.
- **Production**: disabled IDs are filtered out at load time (fail-closed).

## Where enforced
- Packs: `src/core/config/flags.ts` + loaders
- Drills: `src/core/drills/loader.ts`, `src/core/curriculum/loader.ts`
- Lessons: `src/core/coaching/lessons.ts`
- Competitions: `src/core/competitions/loader.ts`

## Diagnostics
Open **Settings → Diagnostics** to see which IDs are currently blocked.

