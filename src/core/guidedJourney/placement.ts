import type { FirstWinSnapshot, JourneyRouteId, OnboardingIntent, PlacementSnapshot, CoachingMode } from './types'
import { loadGuidedJourneyProgram } from './loader'

type PlacementInput = {
  coachingMode: CoachingMode
  onboardingIntent: OnboardingIntent
  timeToFirstVocalResponseMs: number | null
  ambientNoiseFloor: number
  glideSuccess: number
  sustainDurationMs: number
  sustainStability: number
  retryCount: number
  pitchBand: { lowMidi: number | null; highMidi: number | null }
}

export function choosePlacement(input: PlacementInput): PlacementSnapshot {
  const program = loadGuidedJourneyProgram()
  let routeId: JourneyRouteId = 'R4'
  let confidence = 0.58

  const slowResponse = input.timeToFirstVocalResponseMs != null && input.timeToFirstVocalResponseMs > 2600
  const fragileEntry = input.retryCount >= 2 || slowResponse
  const advancedSignals = input.sustainDurationMs >= 2600 && input.sustainStability <= 16 && input.glideSuccess >= 0.7
  const weakPitchSignals = input.glideSuccess < 0.45 || input.sustainStability >= 24
  const beginnerSignals = input.sustainDurationMs < 1200 || input.retryCount >= 3

  if (advancedSignals && input.coachingMode === 'performerCoach') {
    routeId = 'R5'
    confidence = 0.88
  } else if (input.onboardingIntent === 'justStarting' || beginnerSignals || input.coachingMode === 'starter') {
    routeId = 'R1'
    confidence = 0.8
  } else if (fragileEntry || input.onboardingIntent === 'justExplore') {
    routeId = 'R3'
    confidence = 0.74
  } else if (weakPitchSignals || input.onboardingIntent === 'singInTune') {
    routeId = 'R2'
    confidence = 0.72
  } else {
    routeId = 'R4'
    confidence = 0.66
  }

  const route = program.routesById[routeId]
  const firstStageId = route?.primaryStageIds[0] ?? program.stages[0].id
  const firstStage = program.stagesById[firstStageId] ?? program.stages[0]
  const firstLessonId = firstStage.lessonIds[0]
  const firstLessonTitle = program.lessonsById[firstLessonId]?.title

  const family = estimateLikelyFamily(input.pitchBand)

  return {
    routeId,
    stageId: firstStageId,
    lessonId: firstLessonId,
    confidence,
    recommendedLessonTitle: firstLessonTitle,
    likelyFamily: family.label,
    likelyFamilyConfidence: family.confidence,
    recalibrationNeeded: input.ambientNoiseFloor > 0.05,
  }
}

export function estimateLikelyFamily(pitchBand: { lowMidi: number | null; highMidi: number | null }) {
  if (pitchBand.lowMidi == null || pitchBand.highMidi == null) return { label: null, confidence: 0 }
  const center = (pitchBand.lowMidi + pitchBand.highMidi) / 2
  const span = pitchBand.highMidi - pitchBand.lowMidi
  if (span < 3) return { label: null, confidence: 0.18 }
  if (center >= 67) return { label: 'Likely lighter / higher voice', confidence: 0.68 }
  if (center <= 57) return { label: 'Likely fuller / lower voice', confidence: 0.68 }
  return { label: 'Likely mid-range voice', confidence: 0.62 }
}

export function buildFirstWinSnapshot(input: Omit<FirstWinSnapshot, 'placement'> & { coachingMode: CoachingMode; onboardingIntent: OnboardingIntent }) {
  const placement = choosePlacement({
    coachingMode: input.coachingMode,
    onboardingIntent: input.onboardingIntent,
    timeToFirstVocalResponseMs: input.timeToFirstVocalResponseMs,
    ambientNoiseFloor: input.ambientNoiseFloor,
    glideSuccess: input.glideSuccess,
    sustainDurationMs: input.sustainDurationMs,
    sustainStability: input.sustainStability,
    retryCount: input.retryCount,
    pitchBand: input.roughComfortablePitchBand,
  })

  return {
    ...input,
    placement,
  }
}
