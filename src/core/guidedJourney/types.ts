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

export type GuidedJourneyRubricDimensionName =
  | 'technique_accuracy'
  | 'efficiency_health'
  | 'stability_repeatability'
  | 'transfer_application'
  | 'stylism_communication'
  | 'independence_self_coaching'

export type GuidedJourneyAssessmentSectionName =
  | 'technical'
  | 'retention'
  | 'transfer'
  | 'style_or_communication'
  | 'pressure'
  | 'health'
  | 'independence'

export type GuidedJourneyLoadTierId = 'LT1' | 'LT2' | 'LT3' | 'LT4' | string

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
  researchBasis: string[]
  loadProfile?: string
  repertoireTransferFocus?: string
  promotionGateSummary?: string
  styleBranchHooks: string[]
}

export type GuidedJourneyPracticeStructure = {
  checkIn?: string
  priming?: string
  acquisitionBlock?: string
  variabilityBlock?: string
  transferBlock?: string
  reflectionPrompt?: {
    starter?: string
    advanced?: string
  }
  coolDown?: string
}

export type GuidedJourneyMasteryGate = Partial<Record<GuidedJourneyAssessmentSectionName | 'technical', string>>

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
  lessonOutcomes: string[]
  coachModel?: string
  loadTierTarget?: GuidedJourneyLoadTierId
  styleBranchHooks: string[]
  repertoireBridge?: string
  carryoverCue?: string
  practiceStructure?: GuidedJourneyPracticeStructure
  masteryGate?: GuidedJourneyMasteryGate
  motorLearningFocus?: string
  pressurePolicy?: string
  healthWatchouts: string[]
  identityRepertoireHook?: string
  ensembleTransferHook?: string
}

export type GuidedJourneyDrillScoringLogic = {
  primary?: string
  rubricDimensions: GuidedJourneyRubricDimensionName[]
  gateEmphasis?: GuidedJourneyAssessmentSectionName | string
  styleOrCommunicationWeight?: number
}

export type GuidedJourneyAssessmentEvidence = {
  technical?: boolean
  retention?: boolean
  transfer?: boolean
  styleOrCommunication?: boolean
  pressure?: boolean
  health?: boolean
  independence?: boolean
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
  scoringLogic?: GuidedJourneyDrillScoringLogic
  masteryThreshold: number
  safetyNotes: string[]
  loadTier?: GuidedJourneyLoadTierId
  practiceMode?: string
  attentionalFocus?: string
  coachModel?: string
  styleBranchHooks: string[]
  repertoireBridge?: string
  carryoverCue?: string
  microGoal?: string
  assessmentEvidence?: GuidedJourneyAssessmentEvidence
  learningPhase?: string
  randomizationMode?: string
  performanceContexts: string[]
  selfRatingPrompt?: {
    starter?: string
    advanced?: string
  }
  healthAbortRule?: string
  loadBudgetPoints?: number
  pressureLadderStep?: string
  transferTaskType?: string
  ensembleVariant?: string
  externalFocusCue?: string
  independencePrompt?: string
  contextTransferNote?: string
  branchVariantHint?: string
}

export type GuidedJourneyAssessmentSection = {
  name: GuidedJourneyAssessmentSectionName | string
  description: string
}

export type GuidedJourneyAssessment = {
  id: string
  stageId: string
  title: string
  type?: string
  criteria: Record<string, string>
  lessonIds: string[]
  passThreshold: number
  drillIds: string[]
  benchmarkDrillIds: string[]
  sections: GuidedJourneyAssessmentSection[]
  promotionRules: string[]
  outcomes: string[]
}

export type GuidedJourneyRubricDimension = {
  id: string
  name: GuidedJourneyRubricDimensionName | string
  description: string
}

export type GuidedJourneyLoadTier = {
  id: GuidedJourneyLoadTierId
  name: string
  description: string
  maxConsecutiveHighFocusMinutes?: number
  recommendedRecovery?: string
}

export type GuidedJourneyLoadTierConfig = {
  tiers: GuidedJourneyLoadTier[]
  rules: string[]
}

export type GuidedJourneyPressureLadders = Record<string, string[]>

export type GuidedJourneyWeeklyPracticePlanEntry = {
  daysPerWeek?: number
  sessionLength?: string
  loadPattern: string[]
  plan: string[]
}

export type GuidedJourneySessionArchitectureStep = {
  step: string
  goal: string
  coachRule?: string
}

export type GuidedJourneySessionArchitecture = {
  defaultFlow: GuidedJourneySessionArchitectureStep[]
  notes: string[]
}

export type GuidedJourneyVocalHealthMonitoring = {
  yellowFlags: string[]
  redFlags: string[]
  actions: {
    yellow?: string
    red?: string
  }
  speakingVoiceRule?: string
}

export type GuidedJourneyRecoveryProtocols = Record<string, string[]>

export type GuidedJourneyDiagnosisProfile = {
  tag: string
  detectionRule: string
  routeToDrills: PackDrillFamily[]
  coachTipTemplate?: string
}

export type GuidedJourneyRemediationBundle = {
  id: string
  name: string
  triggers: string[]
  lessonPattern: string[]
  exitRule?: string
}

export type GuidedJourneyRemediationRules = {
  diagnosisProfiles: GuidedJourneyDiagnosisProfile[]
  helpModeTriggerRules: string[]
  helpModeAdjustments: Record<string, string | number | boolean>
  remediationBundles: GuidedJourneyRemediationBundle[]
}

export type GuidedJourneyProgressionRules = {
  stagePassThresholds: Record<string, number>
  lessonCompletionLogic: string[]
  unlockLogic: string[]
  masteryLogic: string[]
  fairnessGuards: string[]
  periodizationRules: string[]
}

export type GuidedJourneyProgram = {
  id: string
  title: string
  description: string
  version: string
  northStar: string
  coreLoop: string
  designPrinciples: string[]
  taxonomies?: Record<string, unknown>
  routes: GuidedJourneyRoute[]
  routesById: Record<string, GuidedJourneyRoute>
  stages: GuidedJourneyStage[]
  stagesById: Record<string, GuidedJourneyStage>
  lessons: GuidedJourneyLesson[]
  lessonsById: Record<string, GuidedJourneyLesson>
  drills: GuidedJourneyDrill[]
  drillsById: Record<string, GuidedJourneyDrill>
  assessments: GuidedJourneyAssessment[]
  assessmentsById: Record<string, GuidedJourneyAssessment>
  assessmentsByStageId: Record<string, GuidedJourneyAssessment | undefined>
  progressionRules: GuidedJourneyProgressionRules
  remediationRules: GuidedJourneyRemediationRules
  suggestedWeeklyPracticePlan: Record<string, GuidedJourneyWeeklyPracticePlanEntry>
  milestoneCheckpoints: Record<string, unknown>[]
  advancedFastTrackOptions: Record<string, unknown>[]
  loadTiers?: GuidedJourneyLoadTierConfig
  masteryGates?: Record<string, GuidedJourneyMasteryGate>
  repertoireTransferMatrix?: Record<string, unknown>[]
  sessionArchitecture?: GuidedJourneySessionArchitecture
  pressureLadders?: GuidedJourneyPressureLadders
  assessmentRubricDimensions: GuidedJourneyRubricDimension[]
  vocalHealthMonitoring?: GuidedJourneyVocalHealthMonitoring
  recoveryProtocols?: GuidedJourneyRecoveryProtocols
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
  noiseFloorDb?: number
  snrDb?: number
  vadConfidence?: number
  clippingRate?: number
  silenceRate?: number
  routeStabilityScore?: number
  clippingRisk: 'low' | 'medium' | 'high'
  firstDrillScore?: number
  firstDrillBand?: 'excellent' | 'pass_strong' | 'pass' | 'near_pass' | 'needs_help' | 'retry'
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
  recommendedLoadTier?: GuidedJourneyLoadTierId | null
  activeRemediationBundleId?: string | null
  activeRemediationBundleName?: string | null
  currentAssessmentFocus?: string[]
}

export type GuidedJourneyAssessmentGateStatus = Record<GuidedJourneyAssessmentSectionName, boolean>

export type GuidedJourneyStoredAssessment = {
  completed: boolean
  score?: number
  attemptId?: string
  recordedAt?: number
  blockedPromotionReasons?: string[]
  recommendedLoadTier?: GuidedJourneyLoadTierId | null
  remediationBundleId?: string | null
  outcome?: string | null
  rubricDimensions?: Partial<Record<GuidedJourneyRubricDimensionName, number>>
  gateStatus?: Partial<GuidedJourneyAssessmentGateStatus>
}

export type GuidedJourneyLessonGateRecord = {
  completed: boolean
  score?: number
  threshold?: number
  recordedAt?: number
  passedDrillCount?: number
  transferPassed?: boolean
  healthCleared?: boolean
  blockedReasons?: string[]
  remediationBundleId?: string | null
}

export type SupportedPackDrillFamily = PackDrillFamily
