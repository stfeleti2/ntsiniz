export type JourneyRouteId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5'

export type CoachingMode = 'starter' | 'casual' | 'practised' | 'performerCoach'

export type OnboardingIntent =
  | 'justStarting'
  | 'singInTune'
  | 'moreControl'
  | 'songsBetter'
  | 'choirWorship'
  | 'justExplore'

export type PackDrillFamily =
  | 'match_note'
  | 'sustain_hold'
  | 'pitch_slide'
  | 'interval_jump'
  | 'melody_echo'
  | 'phrase_sing'
  | 'dynamic_control'
  | 'vowel_shape'
  | 'vibrato_control'
  | 'register_bridge'
  | 'performance_run'
  | 'confidence_rep'

export type GuidedJourneyRoute = {
  id: JourneyRouteId
  title: string
  description: string
  entryLevel?: string
  entryCriteria: string[]
  primaryStageIds: string[]
  adaptiveBias: PackDrillFamily[]
}

export type GuidedJourneyStage = {
  id: string
  title: string
  learnerProfile: string
  goals: string[]
  entryCriteria: string[]
  exitCriteria: string[]
  lessonIds: string[]
  assessmentIds: string[]
}

export type GuidedJourneyLesson = {
  id: string
  title: string
  purpose: string
  level: string
  stageId: string
  estimatedTime: string
  prerequisites: string[]
  drillIds: string[]
  unlockConditions: string[]
  completionCriteria: string[]
  fallbackLessonIds: string[]
  nextLessonIds: string[]
}

export type GuidedJourneyDrill = {
  id: string
  lessonId: string
  stageId: string
  routeId: JourneyRouteId
  title: string
  drillType: PackDrillFamily
  targetSkill: string
  skillCategory: string
  difficulty: string
  orderIndex: number
  prerequisites: string[]
  instructions: string
  coachCues: string[]
  expectedMistakes: string[]
  correctionCues: string[]
  passCriteria: string
  failCriteria: string
  repetitionCount: number
  suggestedDuration: string
  restDuration: string
  masteryThreshold: number
  safetyNotes: string[]
}

export type GuidedJourneyAssessment = {
  id: string
  stageId: string
  title: string
  lessonIds: string[]
  passThreshold: number
  drillIds: string[]
}

export type GuidedJourneyProgram = {
  id: string
  title: string
  description: string
  version: string
  northStar: string
  coreLoop: string
  designPrinciples: string[]
  routes: GuidedJourneyRoute[]
  routesById: Record<string, GuidedJourneyRoute>
  stages: GuidedJourneyStage[]
  stagesById: Record<string, GuidedJourneyStage>
  lessons: GuidedJourneyLesson[]
  lessonsById: Record<string, GuidedJourneyLesson>
  drills: GuidedJourneyDrill[]
  drillsById: Record<string, GuidedJourneyDrill>
  assessments: GuidedJourneyAssessment[]
  assessmentsByStageId: Record<string, GuidedJourneyAssessment | undefined>
}

export type PlacementSnapshot = {
  routeId: JourneyRouteId
  stageId: string
  lessonId: string
  confidence: number
  recommendedLessonTitle?: string
  likelyFamily?: string | null
  likelyFamilyConfidence?: number
  recalibrationNeeded?: boolean
}

export type FirstWinSnapshot = {
  id: string
  createdAt: number
  permissionGranted: boolean
  ambientNoiseFloor: number
  clippingRisk: 'low' | 'medium' | 'high'
  deviceRouteType: string | null
  timeToFirstVocalResponseMs: number | null
  loudnessComfort: 'quiet' | 'comfortable' | 'strong' | null
  roughComfortablePitchBand: { lowMidi: number | null; highMidi: number | null }
  glideSuccess: number
  sustainDurationMs: number
  sustainStability: number
  retryCount: number
  placement: PlacementSnapshot
}

export type VoiceIdentitySnapshot = {
  updatedAt: number
  coachingMode: CoachingMode
  onboardingIntent: OnboardingIntent
  firstWinComplete: boolean
  firstWinVersion: number
  firstWinSnapshot: FirstWinSnapshot | null
  strengths: string[]
  currentFocus: string[]
  comfortZone: { lowMidi: number | null; highMidi: number | null }
  likelyFamily: { label: string | null; confidence: number }
}

export type SupportedPackDrillFamily =
  | 'match_note'
  | 'sustain_hold'
  | 'pitch_slide'
  | 'interval_jump'
  | 'melody_echo'
  | 'confidence_rep'
