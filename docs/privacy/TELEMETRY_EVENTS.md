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

- `guided_lesson_opened`
  - When: a guided lesson teach screen opens.
  - Payload: `{ lessonId, screen }`

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
