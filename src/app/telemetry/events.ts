export type TelemetryEventName =
  | 'app_error'
  | 'i18n_missing_key'
  | 'drill_start'
  | 'drill_complete'
  | 'drill_cancel'
  | 'first_win_started'
  | 'first_win_completed'
  | 'room_read_started'
  | 'room_read_failed'
  | 'signal_lock_acquired'
  | 'first_drill_quality_gate'
  | 'recording_pipeline_error'
  | 'first_win_completed_v2'
  | 'guided_lesson_opened'
  | 'stage_assessment_opened'
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
  room_read_started: { source: string }
  room_read_failed: { reason: string; attempt: number }
  signal_lock_acquired: { latencyMs: number; snrDb: number }
  first_drill_quality_gate: { status: string; reason?: string; snrDb?: number; vadConfidence?: number }
  recording_pipeline_error: { stage: string; reason: string }
  first_win_completed_v2: { routeId: string; snrDb: number; routeStabilityScore: number }
  guided_lesson_opened: { lessonId: string; screen: string }
  stage_assessment_opened: { stageId: string; assessmentId: string }
  karaoke_started: { drillId: string }
  performance_mode_opened: { templateId: string }
  share_session_result: { sessionId: string }
  share_drill_result: { sessionId: string; drillId: string; attemptId: string }
  share_drill_card: { sessionId: string; drillId: string; attemptId: string }
}
