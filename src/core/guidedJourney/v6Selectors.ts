import type { Attempt } from '@/core/storage/attemptsRepo'
import type {
  GuidedJourneyAssessment,
  GuidedJourneyAssessmentGateStatus,
  GuidedJourneyDrill,
  GuidedJourneyLesson,
  GuidedJourneyLoadTier,
  GuidedJourneyProgram,
  GuidedJourneyRemediationBundle,
  GuidedJourneyRubricDimensionName,
  PackDrillFamily,
} from './types'

export type GuidedLessonSessionEvaluation = {
  score: number
  threshold: number
  passedDrillCount: number
  transferPassed: boolean
  healthCleared: boolean
  completed: boolean
  blockedReasons: string[]
  remediationBundleId: string | null
  remediationBundleName: string | null
  gateStatus: Partial<GuidedJourneyAssessmentGateStatus>
  rubricDimensions: Partial<Record<GuidedJourneyRubricDimensionName, number>>
}

export type GuidedEvidenceDimensionSummary = {
  id: string
  label: string
  score: number
}

export type GuidedBlockedGateSummary = {
  id: string
  label: string
  count: number
}

export type GuidedFamilySummary = {
  id: PackDrillFamily
  label: string
  count: number
}

export type GuidedAttemptEvidenceSummary = {
  averageScore: number | null
  strongestDimensions: GuidedEvidenceDimensionSummary[]
  weakestDimensions: GuidedEvidenceDimensionSummary[]
  blockedGates: GuidedBlockedGateSummary[]
  recentFamilies: GuidedFamilySummary[]
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

export function humanizeGuidedKey(value: string | null | undefined) {
  if (!value) return ''
  return value.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())
}

export function getAssessmentSectionLabel(value: string) {
  switch (value) {
    case 'style_or_communication':
      return 'Style / communication'
    default:
      return humanizeGuidedKey(value)
  }
}

export function getRubricDimensionLabel(value: string) {
  switch (value) {
    case 'technique_accuracy':
      return 'Technique accuracy'
    case 'efficiency_health':
      return 'Efficiency / health'
    case 'stability_repeatability':
      return 'Stability / repeatability'
    case 'transfer_application':
      return 'Transfer / application'
    case 'stylism_communication':
      return 'Stylism / communication'
    case 'independence_self_coaching':
      return 'Independence / self-coaching'
    default:
      return humanizeGuidedKey(value)
  }
}

export function getStagePassThreshold(program: GuidedJourneyProgram, stageId: string) {
  return program.progressionRules.stagePassThresholds[stageId] ?? 72
}

export function getAssessmentForStage(program: GuidedJourneyProgram, stageId: string): GuidedJourneyAssessment | null {
  return program.assessmentsByStageId[stageId] ?? null
}

export function getLoadTier(program: GuidedJourneyProgram, loadTierId?: string | null): GuidedJourneyLoadTier | null {
  if (!loadTierId) return null
  return program.loadTiers?.tiers.find((tier) => tier.id === loadTierId) ?? null
}

export function getPressureLadder(program: GuidedJourneyProgram, stageId: string) {
  return program.pressureLadders?.[stageId] ?? []
}

export function getGlobalPressureRules(program: GuidedJourneyProgram) {
  return program.pressureLadders?.global_rules ?? []
}

export function getLessonPrimaryDrill(program: GuidedJourneyProgram, lesson: GuidedJourneyLesson, routeId?: string | null): GuidedJourneyDrill | null {
  const drills = lesson.drillIds.map((id) => program.drillsById[id]).filter(Boolean)
  return drills.find((drill) => !routeId || drill.routeId === routeId) ?? drills[0] ?? null
}

export function getLessonSupportedFamilies(program: GuidedJourneyProgram, lesson: GuidedJourneyLesson, routeId?: string | null): PackDrillFamily[] {
  return unique(
    lesson.drillIds
      .map((id) => program.drillsById[id])
      .filter((drill): drill is GuidedJourneyDrill => Boolean(drill))
      .filter((drill) => !routeId || drill.routeId === routeId)
      .map((drill) => drill.drillType),
  ) as PackDrillFamily[]
}

export function getLessonOutcomes(lesson: GuidedJourneyLesson) {
  return lesson.lessonOutcomes.length ? lesson.lessonOutcomes : lesson.completionCriteria
}

export function getLessonTransferBridge(lesson: GuidedJourneyLesson, drill?: GuidedJourneyDrill | null) {
  return lesson.repertoireBridge ?? drill?.repertoireBridge ?? lesson.carryoverCue ?? null
}

export function getLessonCarryoverCue(lesson: GuidedJourneyLesson, drill?: GuidedJourneyDrill | null) {
  return lesson.carryoverCue ?? drill?.carryoverCue ?? lesson.lessonOutcomes[0] ?? null
}

export function getLessonFocusSummary(lesson: GuidedJourneyLesson, drill?: GuidedJourneyDrill | null) {
  const parts = [
    lesson.motorLearningFocus,
    lesson.pressurePolicy,
    lesson.loadTierTarget ? `Target load ${lesson.loadTierTarget}` : null,
    drill?.learningPhase ? `Phase ${humanizeGuidedKey(drill.learningPhase)}` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}

export function getAssessmentFocusSummary(program: GuidedJourneyProgram, stageId: string) {
  const assessment = getAssessmentForStage(program, stageId)
  if (!assessment) return []
  return assessment.sections.map((section) => section.description)
}

export function getCoachTipForTags(program: GuidedJourneyProgram, tags: string[]) {
  for (const tag of tags) {
    const profile = program.remediationRules.diagnosisProfiles.find((item) => item.tag === tag)
    if (profile?.coachTipTemplate) return profile.coachTipTemplate
  }
  return null
}

export function summarizeGuidedAttemptEvidence(attempts: Attempt[]): GuidedAttemptEvidenceSummary {
  const guided = attempts.filter((attempt) => attempt.metrics?.guidedJourney)
  if (!guided.length) {
    return {
      averageScore: null,
      strongestDimensions: [],
      weakestDimensions: [],
      blockedGates: [],
      recentFamilies: [],
    }
  }

  const dimensionTotals = new Map<string, { total: number; count: number }>()
  const blockedCounts = new Map<string, number>()
  const familyCounts = new Map<PackDrillFamily, number>()

  for (const attempt of guided) {
    const journey = attempt.metrics?.guidedJourney ?? {}
    const dimensions = journey.rubricDimensions as Partial<Record<GuidedJourneyRubricDimensionName, number>> | undefined
    for (const [id, score] of Object.entries(dimensions ?? {})) {
      if (typeof score !== 'number') continue
      const current = dimensionTotals.get(id) ?? { total: 0, count: 0 }
      dimensionTotals.set(id, { total: current.total + score, count: current.count + 1 })
    }

    for (const gate of Array.isArray(journey.blockedBy) ? journey.blockedBy : []) {
      blockedCounts.set(gate, (blockedCounts.get(gate) ?? 0) + 1)
    }

    const family = journey.family as PackDrillFamily | undefined
    if (family) {
      familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1)
    }
  }

  const dimensions = Array.from(dimensionTotals.entries())
    .map(([id, value]) => ({
      id,
      label: getRubricDimensionLabel(id),
      score: Math.round(value.total / value.count),
    }))
    .sort((left, right) => right.score - left.score)

  const blockedGates = Array.from(blockedCounts.entries())
    .map(([id, count]) => ({
      id,
      label: humanizeGuidedKey(id.replace(/\s+/g, '_')),
      count,
    }))
    .sort((left, right) => right.count - left.count)

  const recentFamilies = Array.from(familyCounts.entries())
    .map(([id, count]) => ({
      id,
      label: humanizeGuidedKey(id),
      count,
    }))
    .sort((left, right) => right.count - left.count)

  return {
    averageScore: Math.round(average(guided.map((attempt) => Number(attempt.score) || 0))),
    strongestDimensions: dimensions.slice(0, 3),
    weakestDimensions: [...dimensions].reverse().slice(0, 3),
    blockedGates: blockedGates.slice(0, 3),
    recentFamilies: recentFamilies.slice(0, 3),
  }
}

export function pickRemediationBundle(program: GuidedJourneyProgram, tags: string[]): GuidedJourneyRemediationBundle | null {
  for (const tag of tags) {
    const bundle = program.remediationRules.remediationBundles.find((item) => item.triggers.includes(tag))
    if (bundle) return bundle
  }
  return null
}

function collectLessonAttempts(attempts: Attempt[], lessonId: string, lesson: GuidedJourneyLesson) {
  const drillIds = new Set(lesson.drillIds)
  return attempts.filter((attempt) => {
    const guided = attempt.metrics?.guidedJourney
    if (!guided) return false
    if (guided.lessonId === lessonId) return true
    const packDrillId = guided.packDrillId as string | undefined
    return !!packDrillId && drillIds.has(packDrillId)
  })
}

export function evaluateGuidedLessonSession(
  program: GuidedJourneyProgram,
  lesson: GuidedJourneyLesson,
  attempts: Attempt[],
  tags: string[] = [],
): GuidedLessonSessionEvaluation {
  const relevant = collectLessonAttempts(attempts, lesson.id, lesson)
  const threshold = getStagePassThreshold(program, lesson.stageId)
  const score = Math.round(average(relevant.map((attempt) => Number(attempt.score) || 0)))
  const passedDrillCount = unique(
    relevant
      .filter((attempt) => attempt.metrics?.guidedJourney?.passed)
      .map((attempt) => String(attempt.metrics?.guidedJourney?.packDrillId ?? attempt.drillId)),
  ).length

  const transferRequired =
    lesson.completionCriteria.some((item) => item.toLowerCase().includes('transfer')) ||
    lesson.drillIds.some((id) => program.drillsById[id]?.assessmentEvidence?.transfer)
  const transferPassed =
    !transferRequired ||
    relevant.some(
      (attempt) =>
        attempt.metrics?.guidedJourney?.passed &&
        program.drillsById[String(attempt.metrics?.guidedJourney?.packDrillId ?? '')]?.assessmentEvidence?.transfer,
    )

  const healthCleared = !relevant.some((attempt) => {
    const guided = attempt.metrics?.guidedJourney
    return guided?.healthBlocked || guided?.healthStatus === 'blocked' || guided?.healthStatus === 'red'
  })

  const gateStatus: Partial<GuidedJourneyAssessmentGateStatus> = {
    technical: score >= threshold && passedDrillCount >= 3,
    transfer: transferPassed,
    health: healthCleared,
    retention: relevant.length >= 2,
    pressure: relevant.some((attempt) => Boolean(attempt.metrics?.guidedJourney?.pressureEvidence)),
    independence: relevant.some((attempt) => Boolean(attempt.metrics?.guidedJourney?.selfCoachingCaptured)),
    style_or_communication: relevant.some((attempt) => Boolean(attempt.metrics?.guidedJourney?.styleEvidence)),
  }

  const rubricDimensions = relevant.reduce<Partial<Record<GuidedJourneyRubricDimensionName, number>>>((acc, attempt) => {
    const dims = attempt.metrics?.guidedJourney?.rubricDimensions as Partial<Record<GuidedJourneyRubricDimensionName, number>> | undefined
    if (!dims) return acc
    for (const [key, value] of Object.entries(dims)) {
      const existing = acc[key as GuidedJourneyRubricDimensionName]
      acc[key as GuidedJourneyRubricDimensionName] =
        existing == null ? Number(value) : Math.round((Number(existing) + Number(value)) / 2)
    }
    return acc
  }, {})

  const blockedReasons: string[] = []
  if (!(score >= threshold)) blockedReasons.push(`Lesson average needs to reach ${threshold}.`)
  if (passedDrillCount < 3) blockedReasons.push('At least 3 drills need individual passes before this lesson advances.')
  if (!transferPassed) blockedReasons.push('A transfer rep still needs to pass before the next lesson unlocks.')
  if (!healthCleared) blockedReasons.push('A health or load flag needs to clear before promotion.')

  const remediation = blockedReasons.length ? pickRemediationBundle(program, tags) : null

  return {
    score,
    threshold,
    passedDrillCount,
    transferPassed,
    healthCleared,
    completed: blockedReasons.length === 0 && relevant.length > 0,
    blockedReasons,
    remediationBundleId: remediation?.id ?? null,
    remediationBundleName: remediation?.name ?? null,
    gateStatus,
    rubricDimensions,
  }
}
