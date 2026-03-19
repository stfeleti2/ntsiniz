import { loadContentJson } from '@/core/content/loadWithManifest'
import type {
  GuidedJourneyAssessment,
  GuidedJourneyDrill,
  GuidedJourneyLesson,
  GuidedJourneyProgram,
  GuidedJourneyRoute,
  GuidedJourneyStage,
  JourneyRouteId,
  PackDrillFamily,
} from './types'

type RawJourney = {
  program: {
    id: string
    title: string
    description: string
    version: string
    north_star: string
    core_loop: string
    design_principles: string[]
  }
  routes: Array<{
    id: JourneyRouteId
    title: string
    description: string
    entry_level?: string
    entry_criteria?: string[]
    primary_stage_ids?: string[]
    adaptive_bias?: PackDrillFamily[]
  }>
  stages: Array<{
    id: string
    title: string
    learner_profile: string
    goals?: string[]
    entry_criteria?: string[]
    exit_criteria?: string[]
    lesson_ids?: string[]
    assessment_ids?: string[]
  }>
  lessons: Array<{
    id: string
    title: string
    purpose: string
    level: string
    stage: string
    estimated_time: string
    prerequisites?: string[]
    drill_ids?: string[]
    unlock_conditions?: string[]
    completion_criteria?: string[]
    fallback_lesson_ids?: string[]
    next_lesson_ids?: string[]
  }>
  drills: Array<{
    id: string
    lesson_id: string
    stage_id: string
    route_id: JourneyRouteId
    title: string
    drill_type: PackDrillFamily
    target_skill: string
    skill_category: string
    difficulty: string
    order_index: number
    prerequisites?: string[]
    instructions?: string
    coach_cues?: string[]
    expected_mistakes?: string[]
    correction_cues?: string[]
    pass_criteria?: string
    fail_criteria?: string
    repetition_count?: number
    suggested_duration?: string
    rest_duration?: string
    mastery_threshold?: number
    safety_notes?: string[]
  }>
  assessments?: Array<{
    id: string
    stage_id: string
    title: string
    lesson_ids?: string[]
    pass_threshold?: number
    drill_ids?: string[]
  }>
}

let cache: GuidedJourneyProgram | null = null

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Invalid guided journey ${label}`)
  return value
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function byId<T extends { id: string }>(items: T[]) {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})
}

export function loadGuidedJourneyProgram(): GuidedJourneyProgram {
  if (cache) return cache
  const raw = loadContentJson<RawJourney>('guided_journey/production.en.json')
  if (!raw?.program || !Array.isArray(raw.routes) || !Array.isArray(raw.stages) || !Array.isArray(raw.lessons) || !Array.isArray(raw.drills)) {
    throw new Error('Invalid guided journey dataset')
  }

  const routes: GuidedJourneyRoute[] = raw.routes.map((route) => ({
    id: requireString(route.id, 'route.id') as JourneyRouteId,
    title: requireString(route.title, 'route.title'),
    description: requireString(route.description, 'route.description'),
    entryLevel: typeof route.entry_level === 'string' ? route.entry_level : undefined,
    entryCriteria: asStringArray(route.entry_criteria),
    primaryStageIds: asStringArray(route.primary_stage_ids),
    adaptiveBias: Array.isArray(route.adaptive_bias) ? route.adaptive_bias : [],
  }))

  const stages: GuidedJourneyStage[] = raw.stages.map((stage) => ({
    id: requireString(stage.id, 'stage.id'),
    title: requireString(stage.title, 'stage.title'),
    learnerProfile: requireString(stage.learner_profile, 'stage.learner_profile'),
    goals: asStringArray(stage.goals),
    entryCriteria: asStringArray(stage.entry_criteria),
    exitCriteria: asStringArray(stage.exit_criteria),
    lessonIds: asStringArray(stage.lesson_ids),
    assessmentIds: asStringArray(stage.assessment_ids),
  }))

  const lessons: GuidedJourneyLesson[] = raw.lessons.map((lesson) => ({
    id: requireString(lesson.id, 'lesson.id'),
    title: requireString(lesson.title, 'lesson.title'),
    purpose: requireString(lesson.purpose, 'lesson.purpose'),
    level: requireString(lesson.level, 'lesson.level'),
    stageId: requireString(lesson.stage, 'lesson.stage'),
    estimatedTime: requireString(lesson.estimated_time, 'lesson.estimated_time'),
    prerequisites: asStringArray(lesson.prerequisites),
    drillIds: asStringArray(lesson.drill_ids),
    unlockConditions: asStringArray(lesson.unlock_conditions),
    completionCriteria: asStringArray(lesson.completion_criteria),
    fallbackLessonIds: asStringArray(lesson.fallback_lesson_ids),
    nextLessonIds: asStringArray(lesson.next_lesson_ids),
  }))

  const drills: GuidedJourneyDrill[] = raw.drills.map((drill) => ({
    id: requireString(drill.id, 'drill.id'),
    lessonId: requireString(drill.lesson_id, 'drill.lesson_id'),
    stageId: requireString(drill.stage_id, 'drill.stage_id'),
    routeId: requireString(drill.route_id, 'drill.route_id') as JourneyRouteId,
    title: requireString(drill.title, 'drill.title'),
    drillType: requireString(drill.drill_type, 'drill.drill_type') as PackDrillFamily,
    targetSkill: requireString(drill.target_skill, 'drill.target_skill'),
    skillCategory: requireString(drill.skill_category, 'drill.skill_category'),
    difficulty: requireString(drill.difficulty, 'drill.difficulty'),
    orderIndex: typeof drill.order_index === 'number' ? drill.order_index : 0,
    prerequisites: asStringArray(drill.prerequisites),
    instructions: typeof drill.instructions === 'string' ? drill.instructions : '',
    coachCues: asStringArray(drill.coach_cues),
    expectedMistakes: asStringArray(drill.expected_mistakes),
    correctionCues: asStringArray(drill.correction_cues),
    passCriteria: typeof drill.pass_criteria === 'string' ? drill.pass_criteria : '',
    failCriteria: typeof drill.fail_criteria === 'string' ? drill.fail_criteria : '',
    repetitionCount: typeof drill.repetition_count === 'number' ? drill.repetition_count : 1,
    suggestedDuration: typeof drill.suggested_duration === 'string' ? drill.suggested_duration : '',
    restDuration: typeof drill.rest_duration === 'string' ? drill.rest_duration : '',
    masteryThreshold: typeof drill.mastery_threshold === 'number' ? drill.mastery_threshold : 70,
    safetyNotes: asStringArray(drill.safety_notes),
  }))

  const assessments: GuidedJourneyAssessment[] = Array.isArray(raw.assessments)
    ? raw.assessments.map((assessment) => ({
        id: requireString(assessment.id, 'assessment.id'),
        stageId: requireString(assessment.stage_id, 'assessment.stage_id'),
        title: requireString(assessment.title, 'assessment.title'),
        lessonIds: asStringArray(assessment.lesson_ids),
        passThreshold: typeof assessment.pass_threshold === 'number' ? assessment.pass_threshold : 75,
        drillIds: asStringArray(assessment.drill_ids),
      }))
    : []

  const assessmentsByStageId = assessments.reduce<Record<string, GuidedJourneyAssessment | undefined>>((acc, assessment) => {
    acc[assessment.stageId] = assessment
    return acc
  }, {})

  cache = {
    id: requireString(raw.program.id, 'program.id'),
    title: requireString(raw.program.title, 'program.title'),
    description: requireString(raw.program.description, 'program.description'),
    version: requireString(raw.program.version, 'program.version'),
    northStar: requireString(raw.program.north_star, 'program.north_star'),
    coreLoop: requireString(raw.program.core_loop, 'program.core_loop'),
    designPrinciples: asStringArray(raw.program.design_principles),
    routes,
    routesById: byId(routes),
    stages,
    stagesById: byId(stages),
    lessons,
    lessonsById: byId(lessons),
    drills,
    drillsById: byId(drills),
    assessments,
    assessmentsByStageId,
  }

  return cache
}

export function findPackDrill(drillId: string) {
  return loadGuidedJourneyProgram().drillsById[drillId] ?? null
}

export function getRouteStageIds(routeId: JourneyRouteId): string[] {
  return loadGuidedJourneyProgram().routesById[routeId]?.primaryStageIds ?? []
}
