import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { ensureJourneyV3Progress } from '@/core/guidedJourney/progress'
import { mapPackLessonToHostDrills, type HostMappedPackDrill } from '@/core/guidedJourney/hostDrillMapper'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'

export type GuidedLessonVm = {
  lessonId: string
  stageId: string
  routeId: string
  routeTitle: string
  stageTitle: string
  stageProfile: string
  lessonTitle: string
  purpose: string
  estimatedTime: string
  coachingLine: string
  conceptBody: string
  whyThisMatters: string
  musicalPayoff: string
  successLine: string
  techniqueLine: string
  bodyCue: string
  referenceCue: string
  mistakeLine: string
  safetyLine: string
  plan: HostMappedPackDrill[]
}

export async function loadGuidedLessonVm(lessonId?: string): Promise<GuidedLessonVm> {
  const program = loadGuidedJourneyProgram()
  const progress = await ensureJourneyV3Progress()
  const voice = await getVoiceIdentity().catch(() => null)

  const lesson =
    (lessonId ? program.lessonsById[lessonId] : null) ??
    program.lessonsById[progress.lessonId ?? ''] ??
    program.lessons[0]
  const stage = program.stagesById[lesson.stageId] ?? program.stages[0]
  const route = program.routesById[progress.routeId ?? 'R4'] ?? program.routes[0]
  const plan = mapPackLessonToHostDrills(lesson.id, progress.routeId)
  const firstMapped = plan[0] ?? null
  const firstPackDrill = firstMapped ? program.drillsById[firstMapped.packDrillId] ?? null : null

  return {
    lessonId: lesson.id,
    stageId: stage.id,
    routeId: progress.routeId ?? 'R4',
    routeTitle: route.title,
    stageTitle: stage.title,
    stageProfile: stage.learnerProfile,
    lessonTitle: lesson.title,
    purpose: lesson.purpose,
    estimatedTime: lesson.estimatedTime,
    coachingLine: coachingModeLine(voice?.coachingMode ?? 'starter'),
    conceptBody:
      firstPackDrill?.coachCues[0] ??
      `${humanize(firstPackDrill?.targetSkill ?? 'clean_note_matching')} is the main thing this lesson is teaching.`,
    whyThisMatters:
      firstPackDrill?.targetSkill
        ? `This lesson builds ${humanize(firstPackDrill.targetSkill)} so real songs feel steadier and less tense.`
        : stage.learnerProfile,
    musicalPayoff:
      firstPackDrill?.skillCategory
        ? payoffFromCategory(firstPackDrill.skillCategory)
        : 'It helps you carry the same control from drills into actual singing.',
    successLine:
      firstPackDrill?.passCriteria ??
      lesson.completionCriteria[0] ??
      'Finish the mission with one real pass and one clean correction.',
    techniqueLine:
      firstPackDrill?.correctionCues[0] ??
      firstPackDrill?.coachCues[0] ??
      'Keep the breath easy and move toward the pitch instead of grabbing at it.',
    bodyCue:
      inferBodyCue(firstPackDrill?.skillCategory, firstPackDrill?.drillType) ??
      'Release the jaw, let the neck stay quiet, and aim for a calm onset.',
    referenceCue:
      firstPackDrill?.coachCues[1] ??
      firstPackDrill?.instructions ??
      'Listen once, picture the line, then answer with the same shape.',
    mistakeLine:
      firstPackDrill?.expectedMistakes[0] ??
      'The usual miss here is pushing harder instead of singing more clearly.',
    safetyLine:
      firstPackDrill?.safetyNotes[0] ??
      'Keep the sound comfortable. If the voice feels tight, reset before the next rep.',
    plan,
  }
}

function humanize(value: string) {
  return value.replace(/_/g, ' ')
}

function coachingModeLine(mode: string) {
  if (mode === 'performerCoach') return 'Dense cues, quicker pacing, and tighter expectations.'
  if (mode === 'practised') return 'Short prompts with more technical nudges.'
  if (mode === 'casual') return 'Light guidance that stays out of the way while you sing.'
  return 'Gentle, beginner-friendly guidance that keeps the moment calm.'
}

function payoffFromCategory(category: string) {
  if (category.includes('breath')) return 'Longer lines feel less rushed and you stop running out of air halfway through.'
  if (category.includes('interval')) return 'Jumps land cleaner, so melodies stop feeling random.'
  if (category.includes('melody')) return 'You keep the contour of a phrase instead of guessing note by note.'
  if (category.includes('resonance')) return 'Tone starts to ring more easily without extra push.'
  if (category.includes('performance')) return 'You can finish a phrase more confidently even when the pressure rises.'
  return 'It gives you more control that still carries into actual songs.'
}

function inferBodyCue(skillCategory?: string, drillType?: string) {
  if (skillCategory?.includes('breath')) return 'Let the ribs stay open and send the air out in one even stream.'
  if (skillCategory?.includes('interval')) return 'Hear the destination before you jump, then move in one clean gesture.'
  if (skillCategory?.includes('melody')) return 'Think in phrase shape, not isolated notes, so the line stays connected.'
  if (skillCategory?.includes('resonance')) return 'Aim the sound forward with a relaxed mouth instead of pressing from the throat.'
  if (drillType === 'pitch_slide') return 'Keep the throat loose and let the pitch travel like one smooth ribbon.'
  if (drillType === 'sustain_hold') return 'Settle the pitch, then hold it with calm air instead of extra volume.'
  return null
}
