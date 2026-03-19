export type TelemetryEventName =
  | 'app_error'
  | 'i18n_missing_key'
  | 'drill_start'
  | 'drill_complete'
  | 'drill_cancel'
  | 'first_win_started'
  | 'first_win_completed'
  | 'guided_lesson_opened'
  | 'karaoke_started'
  | 'performance_mode_opened'
  | 'share_session_result'
  | 'share_drill_result'
  | 'share_drill_card'

export type TelemetryEventProps = {
  app_error: { message: string; errorName: string; fatal: boolean; platform: string }
  i18n_missing_key: { key: string; locale: string }
  drill_start: { sessionId: string; drillId: string }
  drill_complete: { sessionId: string; drillId: string; score: number }
  drill_cancel: { sessionId: string; drillId: string }
  first_win_started: { source: string }
  first_win_completed: { routeId: string }
  guided_lesson_opened: { lessonId: string; screen: string }
  karaoke_started: { drillId: string }
  performance_mode_opened: { templateId: string }
  share_session_result: { sessionId: string }
  share_drill_result: { sessionId: string; drillId: string; attemptId: string }
  share_drill_card: { sessionId: string; drillId: string; attemptId: string }
}
