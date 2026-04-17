import { listAttemptsBySession } from '@/core/storage/attemptsRepo'
import { getUserState, upsertUserState } from '@/core/storage/userStateRepo'
import { loadGuidedJourneyProgram } from './loader'
import { getVoiceIdentity, upsertVoiceIdentity } from './voiceIdentityRepo'
import type {
  GuidedJourneyAssessment,
  GuidedJourneyLesson,
  GuidedJourneyProgram,
  GuidedJourneyStoredAssessment,
  JourneyRouteId,
} from './types'
import { evaluateGuidedLessonSession, getAssessmentForStage, getStagePassThreshold } from './v6Selectors'

export type JourneyV3Progress = NonNullable<Awaited<ReturnType<typeof getUserState>>['journeyV3']>

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function stageRequiresStyleGate(stageId: string) {
  const num = Number(String(stageId).replace(/\D/g, ''))
  return Number.isFinite(num) && num >= 3
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)))
}

export async function getJourneyV3Progress(): Promise<JourneyV3Progress> {
  const state = await getUserState()
  return {
    routeId: state.journeyV3?.routeId ?? null,
    stageId: state.journeyV3?.stageId ?? null,
    lessonId: state.journeyV3?.lessonId ?? null,
    unlockedLessonIds: state.journeyV3?.unlockedLessonIds ?? [],
    completedLessonIds: state.journeyV3?.completedLessonIds ?? [],
    completedStageIds: state.journeyV3?.completedStageIds ?? [],
    assessmentByStageId: state.journeyV3?.assessmentByStageId ?? {},
    lessonGateByLessonId: state.journeyV3?.lessonGateByLessonId ?? {},
    activeRemediationBundleId: state.journeyV3?.activeRemediationBundleId ?? null,
    blockedPromotionReasons: state.journeyV3?.blockedPromotionReasons ?? [],
    compareBaseline: state.journeyV3?.compareBaseline ?? null,
    firstWinSnapshotId: state.journeyV3?.firstWinSnapshotId ?? null,
    firstWinCompletedAt: state.journeyV3?.firstWinCompletedAt ?? null,
  }
}

export async function upsertJourneyV3Progress(next: JourneyV3Progress) {
  const state = await getUserState()
  state.journeyV3 = next
  await upsertUserState(state)
}

export function getFirstLessonForRoute(program: GuidedJourneyProgram, routeId: JourneyRouteId): GuidedJourneyLesson {
  const stageId = program.routesById[routeId]?.primaryStageIds[0] ?? program.stages[0]?.id
  const stage = stageId ? program.stagesById[stageId] : program.stages[0]
  const lessonId = stage.lessonIds[0]
  return program.lessonsById[lessonId] ?? program.lessons[0]
}

export async function ensureJourneyV3Progress(routeId: JourneyRouteId = 'R4') {
  const program = loadGuidedJourneyProgram()
  const current = await getJourneyV3Progress()
  if (current.routeId && current.stageId && current.lessonId) return current

  const firstLesson = getFirstLessonForRoute(program, routeId)
  const next: JourneyV3Progress = {
    ...current,
    routeId,
    stageId: firstLesson.stageId,
    lessonId: firstLesson.id,
    unlockedLessonIds: unique([...(current.unlockedLessonIds ?? []), firstLesson.id]),
  }
  await upsertJourneyV3Progress(next)
  return next
}

export async function startJourneyFromPlacement(routeId: JourneyRouteId, snapshotId?: string | null) {
  const program = loadGuidedJourneyProgram()
  const firstLesson = getFirstLessonForRoute(program, routeId)
  const next: JourneyV3Progress = {
    routeId,
    stageId: firstLesson.stageId,
    lessonId: firstLesson.id,
    unlockedLessonIds: [firstLesson.id],
    completedLessonIds: [],
    completedStageIds: [],
    assessmentByStageId: {},
    lessonGateByLessonId: {},
    activeRemediationBundleId: null,
    blockedPromotionReasons: [],
    compareBaseline: null,
    firstWinSnapshotId: snapshotId ?? null,
    firstWinCompletedAt: Date.now(),
  }
  await upsertJourneyV3Progress(next)
  return next
}

export function getCurrentJourneyV3(program: GuidedJourneyProgram, progress: JourneyV3Progress) {
  const routeId = (progress.routeId ?? 'R4') as JourneyRouteId
  const lesson = program.lessonsById[progress.lessonId ?? ''] ?? getFirstLessonForRoute(program, routeId)
  const stage = program.stagesById[lesson.stageId] ?? program.stages[0]
  return { route: program.routesById[routeId], stage, lesson }
}

export function getLessonsForStage(program: GuidedJourneyProgram, stageId: string) {
  const stage = program.stagesById[stageId]
  return stage ? stage.lessonIds.map((id) => program.lessonsById[id]).filter(Boolean) : []
}

export function getStageProgress(program: GuidedJourneyProgram, progress: JourneyV3Progress, stageId: string) {
  const lessons = getLessonsForStage(program, stageId)
  const completedLessonIds = progress.completedLessonIds ?? []
  const completed = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length
  return {
    completed,
    total: lessons.length,
    pct: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
  }
}

function canUnlockLesson(lesson: GuidedJourneyLesson | undefined, completedLessonIds: string[]) {
  if (!lesson) return false
  if (!lesson.prerequisites.length) return true
  return lesson.prerequisites.every((id) => completedLessonIds.includes(id))
}

function buildStageAssessmentRecord(args: {
  assessment: GuidedJourneyAssessment | null
  lessonScore: number
  attemptId?: string | null
  gateStatus: Record<string, boolean | undefined>
  rubricDimensions: Record<string, number | undefined>
  blockedReasons: string[]
  remediationBundleId?: string | null
  lessonCompleted: boolean
  stageId: string
}): GuidedJourneyStoredAssessment | undefined {
  if (!args.assessment) return undefined
  const basePass =
    !!args.gateStatus.technical &&
    !!args.gateStatus.transfer &&
    !!args.gateStatus.health &&
    (!stageRequiresStyleGate(args.stageId) || !!args.gateStatus.style_or_communication)
  return {
    completed: args.lessonCompleted && basePass,
    score: args.lessonScore,
    attemptId: args.attemptId ?? undefined,
    recordedAt: Date.now(),
    blockedPromotionReasons: basePass ? [] : args.blockedReasons,
    recommendedLoadTier: basePass ? null : 'LT1',
    remediationBundleId: args.remediationBundleId ?? null,
    outcome: basePass ? args.assessment.outcomes[0] ?? 'advance to next stage' : args.assessment.outcomes[1] ?? 'repeat current stage with targeted remediation bundle',
    rubricDimensions: args.rubricDimensions,
    gateStatus: args.gateStatus,
  }
}

export async function completeJourneyLesson(
  lessonId: string,
  options?: {
    sessionId?: string
    attemptId?: string | null
    diagnosisTags?: string[]
  },
) {
  const program = loadGuidedJourneyProgram()
  const current = await ensureJourneyV3Progress()
  const lesson = program.lessonsById[lessonId]
  if (!lesson) return current

  const attempts = options?.sessionId ? await listAttemptsBySession(options.sessionId).catch(() => []) : []
  const evaluation = evaluateGuidedLessonSession(program, lesson, attempts, options?.diagnosisTags ?? [])
  const assessment = getAssessmentForStage(program, lesson.stageId)
  const voiceIdentity = await getVoiceIdentity().catch(() => null)

  async function syncVoiceIdentity(activeRemediationBundleId: string | null, focusFallback: string[]) {
    if (!voiceIdentity) return
    const bundle = activeRemediationBundleId
      ? program.remediationRules.remediationBundles.find((item) => item.id === activeRemediationBundleId)
      : null
    await upsertVoiceIdentity({
      ...voiceIdentity,
      updatedAt: Date.now(),
      recommendedLoadTier: activeRemediationBundleId ? 'LT1' : lesson.loadTierTarget ?? null,
      activeRemediationBundleId,
      activeRemediationBundleName: bundle?.name ?? null,
      currentAssessmentFocus: assessment?.sections.map((section) => section.description).slice(0, 3) ?? [],
      currentFocus: uniqueNonEmpty([
        ...(focusFallback.length ? focusFallback : voiceIdentity.currentFocus),
        lesson.carryoverCue,
      ]).slice(0, 4),
    })
  }

  const lessonGateByLessonId = {
    ...(current.lessonGateByLessonId ?? {}),
    [lesson.id]: {
      completed: evaluation.completed,
      score: evaluation.score,
      threshold: evaluation.threshold,
      recordedAt: Date.now(),
      passedDrillCount: evaluation.passedDrillCount,
      transferPassed: evaluation.transferPassed,
      healthCleared: evaluation.healthCleared,
      blockedReasons: evaluation.blockedReasons,
      remediationBundleId: evaluation.remediationBundleId,
    },
  }

  if (!evaluation.completed) {
    const fallbackLesson = lesson.fallbackLessonIds.map((id) => program.lessonsById[id]).find(Boolean)
    const next: JourneyV3Progress = {
      ...current,
      lessonId: fallbackLesson?.id ?? lesson.id,
      stageId: fallbackLesson?.stageId ?? lesson.stageId,
      unlockedLessonIds: unique([...(current.unlockedLessonIds ?? []), ...(fallbackLesson ? [fallbackLesson.id] : [])]),
      lessonGateByLessonId,
      activeRemediationBundleId: evaluation.remediationBundleId,
      blockedPromotionReasons: evaluation.blockedReasons,
      assessmentByStageId: {
        ...(current.assessmentByStageId ?? {}),
        [lesson.stageId]:
          buildStageAssessmentRecord({
            assessment: getAssessmentForStage(program, lesson.stageId),
            lessonScore: evaluation.score,
            attemptId: options?.attemptId,
            gateStatus: evaluation.gateStatus,
            rubricDimensions: evaluation.rubricDimensions,
            blockedReasons: evaluation.blockedReasons,
            remediationBundleId: evaluation.remediationBundleId,
            lessonCompleted: false,
            stageId: lesson.stageId,
          }) ?? (current.assessmentByStageId ?? {})[lesson.stageId],
      },
    }
    await upsertJourneyV3Progress(next)
    await syncVoiceIdentity(
      evaluation.remediationBundleId,
      uniqueNonEmpty([
        evaluation.blockedReasons[0],
        lesson.healthWatchouts[0],
        lesson.lessonOutcomes[0],
      ]),
    )
    return next
  }

  const completedLessonIds = unique([...(current.completedLessonIds ?? []), lessonId])
  let completedStageIds = [...(current.completedStageIds ?? [])]
  const stage = program.stagesById[lesson.stageId]
  const stageLessonsComplete = stage ? stage.lessonIds.every((id) => completedLessonIds.includes(id)) : false
  const stageAssessment = getAssessmentForStage(program, lesson.stageId)
  const stageAssessmentRecord =
    buildStageAssessmentRecord({
      assessment: stageAssessment,
      lessonScore: evaluation.score || getStagePassThreshold(program, lesson.stageId),
      attemptId: options?.attemptId,
      gateStatus: evaluation.gateStatus,
      rubricDimensions: evaluation.rubricDimensions,
      blockedReasons: evaluation.blockedReasons,
      remediationBundleId: evaluation.remediationBundleId,
      lessonCompleted: true,
      stageId: lesson.stageId,
    }) ?? null

  if (stageLessonsComplete && (!stageAssessment || stageAssessmentRecord?.completed)) {
    completedStageIds = unique([...completedStageIds, stage.id])
  }

  const candidates = lesson.nextLessonIds.length
    ? lesson.nextLessonIds
    : stage?.lessonIds.filter((id) => !completedLessonIds.includes(id) && id !== lessonId) ?? []
  let nextLesson = candidates.map((id) => program.lessonsById[id]).find((candidate) => canUnlockLesson(candidate, completedLessonIds))

  if (!nextLesson && stage && stageLessonsComplete && (!stageAssessment || stageAssessmentRecord?.completed)) {
    const routeStages = program.routesById[(current.routeId ?? 'R4') as JourneyRouteId]?.primaryStageIds ?? []
    const stageIdx = routeStages.indexOf(lesson.stageId)
    const nextStageId = stageIdx >= 0 ? routeStages[stageIdx + 1] : undefined
    const nextStage = nextStageId ? program.stagesById[nextStageId] : undefined
    nextLesson = nextStage ? nextStage.lessonIds.map((id) => program.lessonsById[id]).find(Boolean) : undefined
  }

  const blockedPromotionReasons =
    stageLessonsComplete && stageAssessment && !stageAssessmentRecord?.completed
      ? stageAssessmentRecord?.blockedPromotionReasons ?? ['Stage benchmark still needs a clean pass.']
      : []

  const next: JourneyV3Progress = {
    ...current,
    stageId: nextLesson?.stageId ?? lesson.stageId,
    lessonId: nextLesson?.id ?? lesson.id,
    completedLessonIds,
    completedStageIds,
    unlockedLessonIds: unique([
      ...(current.unlockedLessonIds ?? []),
      ...(nextLesson ? [nextLesson.id] : []),
      ...(stage?.lessonIds.filter((id) => completedLessonIds.includes(id)) ?? []),
    ]),
    lessonGateByLessonId,
    activeRemediationBundleId: stageAssessmentRecord?.completed ? null : evaluation.remediationBundleId,
    blockedPromotionReasons,
    assessmentByStageId: {
      ...(current.assessmentByStageId ?? {}),
      ...(stageAssessmentRecord ? { [lesson.stageId]: stageAssessmentRecord } : {}),
    },
  }
  await upsertJourneyV3Progress(next)
  await syncVoiceIdentity(
    stageAssessmentRecord?.completed ? null : evaluation.remediationBundleId,
    uniqueNonEmpty([
      lesson.lessonOutcomes[0],
      lesson.carryoverCue,
      stageAssessmentRecord?.completed ? assessment?.title : blockedPromotionReasons[0],
    ]),
  )
  return next
}
