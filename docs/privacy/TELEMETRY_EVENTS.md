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

- `share_session_result`
  - When: user shares a session result.
  - Payload: `{ sessionId }`

- `share_drill_result`
  - When: user shares a drill result.
  - Payload: `{ sessionId, drillId, attemptId }`

- `share_drill_card`
  - When: user shares a drill card.
  - Payload: `{ sessionId, drillId, attemptId }`
