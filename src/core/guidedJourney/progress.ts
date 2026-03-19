import { getUserState, upsertUserState } from '@/core/storage/userStateRepo'
import { loadGuidedJourneyProgram } from './loader'
import type { GuidedJourneyLesson, GuidedJourneyProgram, JourneyRouteId } from './types'

export type JourneyV3Progress = NonNullable<Awaited<ReturnType<typeof getUserState>>['journeyV3']>

function unique(values: string[]) {
  return Array.from(new Set(values))
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

export async function completeJourneyLesson(lessonId: string) {
  const program = loadGuidedJourneyProgram()
  const current = await ensureJourneyV3Progress()
  const lesson = program.lessonsById[lessonId]
  if (!lesson) return current

  const completedLessonIds = unique([...(current.completedLessonIds ?? []), lessonId])
  let completedStageIds = [...(current.completedStageIds ?? [])]
  const stage = program.stagesById[lesson.stageId]
  if (stage && stage.lessonIds.every((id) => completedLessonIds.includes(id))) {
    completedStageIds = unique([...completedStageIds, stage.id])
  }

  const candidates = lesson.nextLessonIds.length
    ? lesson.nextLessonIds
    : stage?.lessonIds.filter((id) => !completedLessonIds.includes(id) && id !== lessonId) ?? []
  let nextLesson = candidates.map((id) => program.lessonsById[id]).find((candidate) => canUnlockLesson(candidate, completedLessonIds))

  if (!nextLesson) {
    const routeStages = program.routesById[(current.routeId ?? 'R4') as JourneyRouteId]?.primaryStageIds ?? []
    const stageIdx = routeStages.indexOf(lesson.stageId)
    const nextStageId = stageIdx >= 0 ? routeStages[stageIdx + 1] : undefined
    const nextStage = nextStageId ? program.stagesById[nextStageId] : undefined
    nextLesson = nextStage ? nextStage.lessonIds.map((id) => program.lessonsById[id]).find(Boolean) : undefined
  }

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
  }
  await upsertJourneyV3Progress(next)
  return next
}

function canUnlockLesson(lesson: GuidedJourneyLesson | undefined, completedLessonIds: string[]) {
  if (!lesson) return false
  if (!lesson.prerequisites.length) return true
  return lesson.prerequisites.every((id) => completedLessonIds.includes(id))
}
