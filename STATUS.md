# Ntsiniz Guided Journey V3 Status

_Last updated: 2026-03-19_

## 1. Entry / First Run
- ✅ `Welcome`, `Goal + Guidance`, `Voice Check Intro`, `WakeYourVoice`, `FirstWinResult`
- ✅ First-win persistence for environment, comfort band, sustain/glide, route hint, placement confidence, retry count
- ✅ Recovery routing for mic denied, mic blocked, noisy room, no voice, too quiet, too loud, route changed, retune

## 2. Home / Journey
- ✅ Premium `Home` with chapter hero, voice resume, coach insight, progress path, milestones/compare/profile entry points
- ✅ `Journey` map driven by production pack stages `S1` to `S5`
- ✅ `CurriculumOverview` repurposed as chapter overview
- ✅ `CurriculumDayPreview` repurposed as lesson intro / concept / drill prep

## 3. Lesson / Teach
- ✅ `Session` now launches pack-backed lessons and mapped drill plans inside the host architecture
- ✅ Dedicated `LessonIntro`, `ConceptExplainer`, `TechniqueHelp`, `WhyThisMatters`, and `DrillPrep` routes are wired into the live lesson flow
- ✅ `CurriculumDayPreview` now routes into the teach family screen-by-screen instead of keeping those moments trapped in one card stack

## 4. Live Singing / Practice
- ✅ `Tuner` refreshed with low-chrome premium live feedback
- ✅ `Drill` now carries pack drill IDs through the host runner and persists pack-aware result metadata
- ✅ Direct-support families wired through the scoring adapter: `match_note`, `sustain_hold`, `pitch_slide`, `interval_jump`, `melody_echo`, `confidence_rep`
- 🟡 Unsupported advanced families are pack-backed and routeable, but still execute through mapped host drill types
- ✅ Dedicated karaoke / song mode launcher added behind `karaokeV1`, powered by real `song_phrase_*` drills
- ✅ Dedicated `PerformanceMode` and `PerformancePreview` are now exposed through the real stack behind `performanceModeV1`

## 5. Results / Playback
- ✅ `DrillResult` shows key success, key fix, and next action from real guided scoring output
- ✅ `Results`, `SessionSummary`, `Playback`, and `CompareProgress` now surface guided coach notes and next-step logic
- ✅ Weekly flex / share flow now lands on an upgraded `WeeklyReport` closure surface with day count, week-over-week delta, watermark, and share CTA

## 6. Profile / Voice Identity
- ✅ `VoiceProfile`, `RangeSnapshot`, `VocalFamily`, `PersonalPlan`, `Insights`
- ✅ Vocal family stays soft-gated behind confidence
- 🟡 Strengths / weaknesses and plan logic are real but still lightweight compared with the full long-term diagnosis vision

## 7. Recovery / Trust
- ✅ Calm recovery surface with shared status pills / icons
- ✅ No onboarding mic ask on welcome
- ✅ Privacy / on-device trust messaging integrated into first-run permission flow

## 8. Engine + State Integration
- ✅ Production pack vendored into the repo
- ✅ Guided journey domain added for routes, stages, lessons, drills, placement, and voice identity
- ✅ Adaptive reducer integrated with persisted attempt metrics
- ✅ Session meta now carries guided journey plan metadata through drill execution
- ✅ Route/state contracts extended for onboarding, profile, milestones, compare progress, and recovery

## 9. Dataset + DB
- ✅ Production curriculum added to the content system
- ✅ Content index and manifest regenerated; manifest signature refreshed
- ✅ Voice identity and adaptive state stored without a breaking DB migration

## 10. Monetization-safe Integration
- ✅ No ads / paywalls inserted into onboarding, live singing, playback, or recovery moments
- ✅ Rewarded boost remains on safe session-closure surface only
- 🟡 Broader monetization audit outside the touched journey surfaces still depends on host product review

## 11. Testing / QA / Release
- ✅ Added core tests for guided journey pack shape, scoring adapter, and adaptive reducer
- ✅ Updated surface policy coverage for the new first-run stack
- ✅ Passed: `npm run lint`
- ✅ Passed: `npm run typecheck`
- ✅ Passed: `npm run check:i18n`
- ✅ Passed: `npm run check:locale-formatting`
- ✅ Passed: `npm run check:telemetry`
- ✅ Passed: `npm run check:telemetry-pii`
- ✅ Passed: `npm run check:content-manifest`
- ✅ Passed: `npm run check:content-signature`
- ✅ Passed: `npm test`
- ✅ Passed: `npm run build:check`
