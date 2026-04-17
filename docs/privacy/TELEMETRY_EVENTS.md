# Telemetry Events (Truth List)

This file is the **canonical list** of telemetry events that can be buffered locally and (only with consent) forwarded to crash reporting.

**Source of truth in code:** `src/app/telemetry/events.ts`

## Events

- `app_error`
  - When: global error handler catches an unhandled error.
  - Payload: `{ message, name, fatal, platform }`

- `i18n_missing_key`
  - When: UI requested a translation key that is missing from the active locale dictionary.
  - Payload: `{ key, locale }`

- `drill_start`
  - When: user starts a drill.
  - Payload: `{ sessionId, drillId }`

- `drill_complete`
  - When: a drill finishes normally.
  - Payload: `{ sessionId, drillId, score }`

- `drill_cancel`
  - When: user cancels a drill.
  - Payload: `{ sessionId, drillId }`

- `first_win_started`
  - When: the guided first-win voice flow starts.
  - Payload: `{ source }`

- `first_win_completed`
  - When: the guided first-win flow completes and a soft route is assigned.
  - Payload: `{ routeId }`

- `room_read_started`
  - When: onboarding room profiling starts for the first live drill.
  - Payload: `{ source }`

- `room_read_failed`
  - When: room profiling or signal lock fails before first-win completion.
  - Payload: `{ reason, attempt }`

- `signal_lock_acquired`
  - When: live vocal signal lock is acquired during onboarding first drill.
  - Payload: `{ latencyMs, snrDb }`

- `first_drill_quality_gate`
  - When: onboarding first-drill quality gate passes or fails.
  - Payload: `{ status, reason?, snrDb?, vadConfidence? }`

- `recording_pipeline_error`
  - When: capture/recording pipeline throws in trust-critical paths.
  - Payload: `{ stage, reason }`

- `first_win_completed_v2`
  - When: onboarding first win finishes with the upgraded DSP/quality path.
  - Payload: `{ routeId, snrDb, routeStabilityScore }`

- `guided_lesson_opened`
  - When: a guided lesson teach screen opens.
  - Payload: `{ lessonId, screen }`

- `stage_assessment_opened`
  - When: the dedicated V6 stage benchmark screen opens.
  - Payload: `{ stageId, assessmentId }`

- `karaoke_started`
  - When: user starts a song-phrase karaoke mission.
  - Payload: `{ drillId }`

- `performance_mode_opened`
  - When: the performance recording mode opens.
  - Payload: `{ templateId }`

- `share_session_result`
  - When: user shares a session result.
  - Payload: `{ sessionId }`

- `share_drill_result`
  - When: user shares a drill result.
  - Payload: `{ sessionId, drillId, attemptId }`

- `share_drill_card`
  - When: user shares a drill card.
  - Payload: `{ sessionId, drillId, attemptId }`
