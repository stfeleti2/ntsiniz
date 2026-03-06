export type TelemetryEventName =
  | 'app_error'
  | 'i18n_missing_key'
  | 'drill_start'
  | 'drill_complete'
  | 'drill_cancel'
  | 'share_session_result'
  | 'share_drill_result'
  | 'share_drill_card'

export type TelemetryEventProps = {
  app_error: { message: string; errorName: string; fatal: boolean; platform: string }
  i18n_missing_key: { key: string; locale: string }
  drill_start: { sessionId: string; drillId: string }
  drill_complete: { sessionId: string; drillId: string; score: number }
  drill_cancel: { sessionId: string; drillId: string }
  share_session_result: { sessionId: string }
  share_drill_result: { sessionId: string; drillId: string; attemptId: string }
  share_drill_card: { sessionId: string; drillId: string; attemptId: string }
}
