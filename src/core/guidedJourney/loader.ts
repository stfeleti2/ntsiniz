import type {
  GuidedJourneyAssessment,
  GuidedJourneyAssessmentEvidence,
  GuidedJourneyAssessmentSection,
  GuidedJourneyDrill,
  GuidedJourneyDrillScoringLogic,
  GuidedJourneyLesson,
  GuidedJourneyLoadTierConfig,
  GuidedJourneyMasteryGate,
  GuidedJourneyPracticeStructure,
  GuidedJourneyProgram,
  GuidedJourneyRecoveryProtocols,
  GuidedJourneyRemediationRules,
  GuidedJourneyRoute,
  GuidedJourneySessionArchitecture,
  GuidedJourneyStage,
  GuidedJourneyVocalHealthMonitoring,
  GuidedJourneyWeeklyPracticePlanEntry,
  JourneyRouteId,
  PackDrillFamily,
} from './types'

type RawJourney = {
  program: Record<string, unknown>
  taxonomies?: Record<string, unknown>
  routes: Array<Record<string, unknown>>
  stages: Array<Record<string, unknown>>
  lessons: Array<Record<string, unknown>>
  drills: Array<Record<string, unknown>>
  assessments?: Array<Record<string, unknown>>
  progression_rules?: Record<string, unknown>
  remediation_rules?: Record<string, unknown>
  suggested_weekly_practice_plan?: Record<string, unknown>
  milestone_checkpoints?: Record<string, unknown>[]
  advanced_fast_track_options?: Record<string, unknown>[]
  load_tiers?: Record<string, unknown>
  mastery_gates?: Record<string, unknown>
  repertoire_transfer_matrix?: Record<string, unknown>[]
  session_architecture?: Record<string, unknown>
  pressure_ladders?: Record<string, unknown>
  assessment_rubric_dimensions?: Array<Record<string, unknown>>
  vocal_health_monitoring?: Record<string, unknown>
  recovery_protocols?: Record<string, unknown>
}

let cache: GuidedJourneyProgram | null = null

function loadRawJourneyJson(): RawJourney {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadContentJson } = require('../content/loadWithManifest') as {
      loadContentJson: <T>(key: string) => T
    }
    return loadContentJson<RawJourney>('guided_journey/production.en.json')
  } catch {
    const runtimeRequire = new Function('return require')() as NodeRequire
    const fs = runtimeRequire('node:fs') as typeof import('node:fs')
    const path = runtimeRequire('node:path') as typeof import('node:path')
    return JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'src/content/guided_journey/production.en.json'), 'utf8'),
    ) as RawJourney
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Invalid guided journey ${label}`)
  return value
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function asObject<T extends Record<string, unknown>>(value: unknown): T | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as T) : undefined
}

function asRecordOfStrings(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.entries(value).reduce<Record<string, string>>((acc, [key, entry]) => {
    if (typeof entry === 'string') acc[key] = entry
    return acc
  }, {})
}

function byId<T extends { id: string }>(items: T[]) {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})
}

function parsePracticeStructure(value: unknown): GuidedJourneyPracticeStructure | undefined {
  const obj = asObject<Record<string, unknown>>(value)
  if (!obj) return undefined
  const reflection = asObject<Record<string, unknown>>(obj.reflection_prompt)
  return {
    checkIn: asString(obj.check_in),
    priming: asString(obj.priming),
    acquisitionBlock: asString(obj.acquisition_block),
    variabilityBlock: asString(obj.variability_block),
    transferBlock: asString(obj.transfer_block),
    reflectionPrompt: reflection
      ? {
          starter: asString(reflection.starter),
          advanced: asString(reflection.advanced),
        }
      : undefined,
    coolDown: asString(obj.cool_down),
  }
}

function parseMasteryGate(value: unknown): GuidedJourneyMasteryGate | undefined {
  const obj = asObject<Record<string, unknown>>(value)
  if (!obj) return undefined
  return {
    technical: asString(obj.technical),
    retention: asString(obj.retention),
    transfer: asString(obj.transfer),
    style_or_communication: asString(obj.style_or_communication),
    pressure: asString(obj.pressure),
    health: asString(obj.health),
    independence: asString(obj.independence),
  }
}

function parseScoringLogic(value: unknown): GuidedJourneyDrillScoringLogic | undefined {
  const obj = asObject<Record<string, unknown>>(value)
  if (!obj) return undefined
  return {
    primary: asString(obj.primary),
    rubricDimensions: asStringArray(obj.rubric_dimensions) as GuidedJourneyDrillScoringLogic['rubricDimensions'],
    gateEmphasis: asString(obj.gate_emphasis),
    styleOrCommunicationWeight: asNumber(obj.style_or_communication_weight),
  }
}

function parseAssessmentEvidence(value: unknown): GuidedJourneyAssessmentEvidence | undefined {
  const obj = asObject<Record<string, unknown>>(value)
  if (!obj) return undefined
  return {
    technical: asBoolean(obj.technical),
    retention: asBoolean(obj.retention),
    transfer: asBoolean(obj.transfer),
    styleOrCommunication: asBoolean(obj.style_or_communication),
    pressure: asBoolean(obj.pressure),
    health: asBoolean(obj.health),
    independence: asBoolean(obj.independence),
  }
}

function parseSelfRatingPrompt(value: unknown) {
  const obj = asObject<Record<string, unknown>>(value)
  if (!obj) return undefined
  return {
    starter: asString(obj.starter),
    advanced: asString(obj.advanced),
  }
}

function parseAssessmentSections(value: unknown): GuidedJourneyAssessmentSection[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      const obj = asObject<Record<string, unknown>>(item)
      if (!obj) return null
      const name = asString(obj.name)
      const description = asString(obj.description)
      if (!name || !description) return null
      return { name, description }
    })
    .filter(Boolean) as GuidedJourneyAssessmentSection[]
}

function parseWeeklyPracticePlan(value: unknown): Record<string, GuidedJourneyWeeklyPracticePlanEntry> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.entries(value).reduce<Record<string, GuidedJourneyWeeklyPracticePlanEntry>>((acc, [key, entry]) => {
    const obj = asObject<Record<string, unknown>>(entry)
    if (!obj) return acc
    acc[key] = {
      daysPerWeek: asNumber(obj.days_per_week),
      sessionLength: asString(obj.session_length),
      loadPattern: asStringArray(obj.load_pattern),
      plan: asStringArray(obj.plan),
    }
    return acc
  }, {})
}

function parseLoadTiers(value: unknown): GuidedJourneyLoadTierConfig | undefined {
  const obj = asObject<Record<string, unknown>>(value)
  if (!obj) return undefined
  return {
    tiers: (Array.isArray(obj.tiers) ? obj.tiers : [])
      .map((item) => {
        const tier = asObject<Record<string, unknown>>(item)
        if (!tier) return null
        const id = asString(tier.id)
        const name = asString(tier.name)
        const description = asString(tier.description)
        if (!id || !name || !description) return null
        return {
          id,
          name,
          description,
          maxConsecutiveHighFocusMinutes: asNumber(tier.max_consecutive_high_focus_minutes),
          recommendedRecovery: asString(tier.recommended_recovery),
        }
      })
      .filter(Boolean) as GuidedJourneyLoadTierConfig['tiers'],
    rules: asStringArray(obj.rules),
  }
}

function parseSessionArchitecture(value: unknown): GuidedJourneySessionArchitecture | undefined {
  const obj = asObject<Record<string, unknown>>(value)
  if (!obj) return undefined
  return {
    defaultFlow: (Array.isArray(obj.default_flow) ? obj.default_flow : [])
      .map((item) => {
        const step = asObject<Record<string, unknown>>(item)
        if (!step) return null
        const id = asString(step.step)
        const goal = asString(step.goal)
        if (!id || !goal) return null
        return {
          step: id,
          goal,
          coachRule: asString(step.coach_rule),
        }
      })
      .filter(Boolean) as GuidedJourneySessionArchitecture['defaultFlow'],
    notes: asStringArray(obj.notes),
  }
}

function parseVocalHealth(value: unknown): GuidedJourneyVocalHealthMonitoring | undefined {
  const obj = asObject<Record<string, unknown>>(value)
  const actions = obj ? asObject<Record<string, unknown>>(obj.actions) : undefined
  if (!obj) return undefined
  return {
    yellowFlags: asStringArray(obj.yellow_flags),
    redFlags: asStringArray(obj.red_flags),
    actions: {
      yellow: asString(actions?.yellow),
      red: asString(actions?.red),
    },
    speakingVoiceRule: asString(obj.speaking_voice_rule),
  }
}

function parseRecoveryProtocols(value: unknown): GuidedJourneyRecoveryProtocols | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return Object.entries(value).reduce<Record<string, string[]>>((acc, [key, entry]) => {
    acc[key] = asStringArray(entry)
    return acc
  }, {})
}

export function loadGuidedJourneyProgram(): GuidedJourneyProgram {
  if (cache) return cache
  const raw = loadRawJourneyJson()
  if (!raw?.program || !Array.isArray(raw.routes) || !Array.isArray(raw.stages) || !Array.isArray(raw.lessons) || !Array.isArray(raw.drills)) {
    throw new Error('Invalid guided journey dataset')
  }
  const progressionRules = asObject<Record<string, unknown>>(raw.progression_rules) ?? {}
  const remediationRules = asObject<Record<string, unknown>>(raw.remediation_rules) ?? {}

  const routes: GuidedJourneyRoute[] = raw.routes.map((route) => ({
    id: requireString(route.id, 'route.id') as JourneyRouteId,
    title: requireString(route.title, 'route.title'),
    description: requireString(route.description, 'route.description'),
    entryLevel: asString(route.entry_level),
    entryCriteria: asStringArray(route.entry_criteria),
    primaryStageIds: asStringArray(route.primary_stage_ids),
    adaptiveBias: Array.isArray(route.adaptive_bias) ? (route.adaptive_bias as PackDrillFamily[]) : [],
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
    researchBasis: asStringArray(stage.research_basis),
    loadProfile: asString(stage.load_profile),
    repertoireTransferFocus: asString(stage.repertoire_transfer_focus),
    promotionGateSummary: asString(stage.promotion_gate_summary),
    styleBranchHooks: asStringArray(stage.style_branch_hooks),
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
    lessonOutcomes: asStringArray(lesson.lesson_outcomes),
    coachModel: asString(lesson.coach_model),
    loadTierTarget: asString(lesson.load_tier_target),
    styleBranchHooks: asStringArray(lesson.style_branch_hooks),
    repertoireBridge: asString(lesson.repertoire_bridge),
    carryoverCue: asString(lesson.carryover_cue),
    practiceStructure: parsePracticeStructure(lesson.practice_structure),
    masteryGate: parseMasteryGate(lesson.mastery_gate),
    motorLearningFocus: asString(lesson.motor_learning_focus),
    pressurePolicy: asString(lesson.pressure_policy),
    healthWatchouts: asStringArray(lesson.health_watchouts),
    identityRepertoireHook: asString(lesson.identity_repertoire_hook),
    ensembleTransferHook: asString(lesson.ensemble_transfer_hook),
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
    scoringLogic: parseScoringLogic(drill.scoring_logic),
    masteryThreshold: typeof drill.mastery_threshold === 'number' ? drill.mastery_threshold : 70,
    safetyNotes: asStringArray(drill.safety_notes),
    loadTier: asString(drill.load_tier),
    practiceMode: asString(drill.practice_mode),
    attentionalFocus: asString(drill.attentional_focus),
    coachModel: asString(drill.coach_model),
    styleBranchHooks: asStringArray(drill.style_branch_hooks),
    repertoireBridge: asString(drill.repertoire_bridge),
    carryoverCue: asString(drill.carryover_cue),
    microGoal: asString(drill.micro_goal),
    assessmentEvidence: parseAssessmentEvidence(drill.assessment_evidence),
    learningPhase: asString(drill.learning_phase),
    randomizationMode: asString(drill.randomization_mode),
    performanceContexts: asStringArray(drill.performance_contexts),
    selfRatingPrompt: parseSelfRatingPrompt(drill.self_rating_prompt),
    healthAbortRule: asString(drill.health_abort_rule),
    loadBudgetPoints: asNumber(drill.load_budget_points),
    pressureLadderStep: asString(drill.pressure_ladder_step),
    transferTaskType: asString(drill.transfer_task_type),
    ensembleVariant: asString(drill.ensemble_variant),
    externalFocusCue: asString(drill.external_focus_cue),
    independencePrompt: asString(drill.independence_prompt),
    contextTransferNote: asString(drill.context_transfer_note),
    branchVariantHint: asString(drill.branch_variant_hint),
  }))

  const assessments: GuidedJourneyAssessment[] = Array.isArray(raw.assessments)
    ? raw.assessments.map((assessment) => ({
        id: requireString(assessment.id, 'assessment.id'),
        stageId: requireString(assessment.stage_id, 'assessment.stage_id'),
        title: requireString(assessment.title ?? assessment.id, 'assessment.title'),
        type: asString(assessment.type),
        criteria: asRecordOfStrings(assessment.criteria),
        lessonIds: asStringArray(assessment.lesson_ids),
        passThreshold: typeof assessment.pass_threshold === 'number' ? assessment.pass_threshold : 75,
        drillIds: asStringArray(assessment.drill_ids),
        benchmarkDrillIds: asStringArray(assessment.benchmark_drill_ids),
        sections: parseAssessmentSections(assessment.sections),
        promotionRules: asStringArray(assessment.promotion_rules),
        outcomes: asStringArray(assessment.outcomes),
      }))
    : []

  const assessmentsById = byId(assessments)
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
    taxonomies: asObject<Record<string, unknown>>(raw.taxonomies),
    routes,
    routesById: byId(routes),
    stages,
    stagesById: byId(stages),
    lessons,
    lessonsById: byId(lessons),
    drills,
    drillsById: byId(drills),
    assessments,
    assessmentsById,
    assessmentsByStageId,
    progressionRules: {
      stagePassThresholds: Object.entries(asObject<Record<string, unknown>>(progressionRules.stage_pass_thresholds) ?? {}).reduce<Record<string, number>>((acc, [key, value]) => {
        const n = asNumber(value)
        if (typeof n === 'number') acc[key] = n
        return acc
      }, {}),
      lessonCompletionLogic: asStringArray(progressionRules.lesson_completion_logic),
      unlockLogic: asStringArray(progressionRules.unlock_logic),
      masteryLogic: asStringArray(progressionRules.mastery_logic),
      fairnessGuards: asStringArray(progressionRules.fairness_guards),
      periodizationRules: asStringArray(progressionRules.periodization_rules),
    },
    remediationRules: {
      diagnosisProfiles: (Array.isArray(remediationRules.diagnosis_profiles) ? remediationRules.diagnosis_profiles : [])
        .map((item) => {
          const profile = asObject<Record<string, unknown>>(item)
          if (!profile) return null
          const tag = asString(profile.tag)
          const detectionRule = asString(profile.detection_rule)
          if (!tag || !detectionRule) return null
          return {
            tag,
            detectionRule,
            routeToDrills: asStringArray(profile.route_to_drills) as PackDrillFamily[],
            coachTipTemplate: asString(profile.coach_tip_template),
          }
        })
        .filter(Boolean) as GuidedJourneyRemediationRules['diagnosisProfiles'],
      helpModeTriggerRules: asStringArray(remediationRules.help_mode_trigger_rules),
      helpModeAdjustments: asObject<Record<string, string | number | boolean>>(remediationRules.help_mode_adjustments) ?? {},
      remediationBundles: (Array.isArray(remediationRules.remediation_bundles) ? remediationRules.remediation_bundles : [])
        .map((item) => {
          const bundle = asObject<Record<string, unknown>>(item)
          if (!bundle) return null
          const id = asString(bundle.id)
          const name = asString(bundle.name)
          if (!id || !name) return null
          return {
            id,
            name,
            triggers: asStringArray(bundle.triggers),
            lessonPattern: asStringArray(bundle.lesson_pattern),
            exitRule: asString(bundle.exit_rule),
          }
        })
        .filter(Boolean) as GuidedJourneyRemediationRules['remediationBundles'],
    },
    suggestedWeeklyPracticePlan: parseWeeklyPracticePlan(raw.suggested_weekly_practice_plan),
    milestoneCheckpoints: Array.isArray(raw.milestone_checkpoints) ? raw.milestone_checkpoints : [],
    advancedFastTrackOptions: Array.isArray(raw.advanced_fast_track_options) ? raw.advanced_fast_track_options : [],
    loadTiers: parseLoadTiers(raw.load_tiers),
    masteryGates: asObject<Record<string, GuidedJourneyMasteryGate>>(raw.mastery_gates),
    repertoireTransferMatrix: Array.isArray(raw.repertoire_transfer_matrix) ? raw.repertoire_transfer_matrix : undefined,
    sessionArchitecture: parseSessionArchitecture(raw.session_architecture),
    pressureLadders: asObject<Record<string, string[]>>(raw.pressure_ladders),
    assessmentRubricDimensions: (Array.isArray(raw.assessment_rubric_dimensions) ? raw.assessment_rubric_dimensions : [])
      .map((item) => {
        const dimension = asObject<Record<string, unknown>>(item)
        if (!dimension) return null
        const id = asString(dimension.id)
        const name = asString(dimension.name)
        const description = asString(dimension.description)
        if (!id || !name || !description) return null
        return { id, name, description }
      })
      .filter(Boolean) as GuidedJourneyProgram['assessmentRubricDimensions'],
    vocalHealthMonitoring: parseVocalHealth(raw.vocal_health_monitoring),
    recoveryProtocols: parseRecoveryProtocols(raw.recovery_protocols),
  }

  return cache
}

export function resetGuidedJourneyProgramCache() {
  cache = null
}

export function findPackDrill(drillId: string) {
  return loadGuidedJourneyProgram().drillsById[drillId] ?? null
}

export function getRouteStageIds(routeId: JourneyRouteId): string[] {
  return loadGuidedJourneyProgram().routesById[routeId]?.primaryStageIds ?? []
}
