import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { evaluateGuidedLessonSession } from '../guidedJourney/v6Selectors'

const rawProgram = JSON.parse(readFileSync('src/content/guided_journey/production.en.json', 'utf8'))
const program = {
  lessons: rawProgram.lessons.map((lesson: any) => ({
    id: lesson.id,
    stageId: lesson.stage,
    drillIds: lesson.drill_ids,
    completionCriteria: lesson.completion_criteria ?? [],
  })),
  drillsById: Object.fromEntries(
    rawProgram.drills.map((drill: any) => [
      drill.id,
      {
        id: drill.id,
        assessmentEvidence: {
          transfer: !!drill.assessment_evidence?.transfer,
        },
      },
    ]),
  ),
  progressionRules: {
    stagePassThresholds: rawProgram.progression_rules.stage_pass_thresholds,
  },
  remediationRules: {
    remediationBundles: rawProgram.remediation_rules.remediation_bundles.map((bundle: any) => ({
      id: bundle.id,
      name: bundle.name,
      triggers: bundle.triggers,
      lessonPattern: bundle.lesson_pattern,
    })),
  },
} as any

test('V6 lesson evaluation blocks completion until transfer evidence passes', () => {
  const lesson = program.lessons.find((item: any) =>
    item.drillIds.some((id: string) => program.drillsById[id]?.assessmentEvidence?.transfer),
  )
  assert.ok(lesson)

  const transferDrill = lesson.drillIds.map((id: string) => program.drillsById[id]).find((drill: any) => drill?.assessmentEvidence?.transfer)
  const nonTransfer = lesson.drillIds.map((id: string) => program.drillsById[id]).filter(Boolean).slice(0, 3)
  assert.ok(transferDrill)
  assert.ok(nonTransfer.length >= 3)

  const blocked = evaluateGuidedLessonSession(
    program,
    lesson,
    nonTransfer.map((drill: any, index: number) => ({
      id: `att_block_${index}`,
      createdAt: Date.now() + index,
      sessionId: 'sess_block',
      drillId: `host_${index}`,
      score: 84,
      metrics: {
        guidedJourney: {
          lessonId: lesson.id,
          packDrillId: drill.id,
          passed: true,
          rubricDimensions: {
            technique_accuracy: 84,
            stability_repeatability: 80,
          },
        },
      },
    })) as any,
    [],
  )

  assert.equal(blocked.completed, false)
  assert.equal(blocked.transferPassed, false)
  assert.equal(blocked.gateStatus.technical, true)

  const passing = evaluateGuidedLessonSession(
    program,
    lesson,
    [transferDrill, ...nonTransfer.slice(0, 2)].map((drill: any, index: number) => ({
      id: `att_pass_${index}`,
      createdAt: Date.now() + index,
      sessionId: 'sess_pass',
      drillId: `host_pass_${index}`,
      score: 86,
      metrics: {
        guidedJourney: {
          lessonId: lesson.id,
          packDrillId: drill.id,
          passed: true,
          rubricDimensions: {
            technique_accuracy: 86,
            transfer_application: drill.id === transferDrill.id ? 84 : undefined,
            stability_repeatability: 83,
          },
        },
      },
    })) as any,
    [],
  )

  assert.equal(passing.completed, true)
  assert.equal(passing.transferPassed, true)
  assert.equal(passing.passedDrillCount, 3)
  assert.equal(passing.gateStatus.technical, true)
})

test('V6 lesson technical gate stays blocked until three drills pass', () => {
  const lesson = program.lessons[0]
  assert.ok(lesson)

  const drills = lesson.drillIds.map((id: string) => program.drillsById[id]).filter(Boolean).slice(0, 2)
  assert.equal(drills.length, 2)

  const result = evaluateGuidedLessonSession(
    program,
    lesson,
    drills.map((drill: any, index: number) => ({
      id: `att_two_${index}`,
      createdAt: Date.now() + index,
      sessionId: 'sess_two',
      drillId: `host_two_${index}`,
      score: 88,
      metrics: {
        guidedJourney: {
          lessonId: lesson.id,
          packDrillId: drill.id,
          passed: true,
          rubricDimensions: {
            technique_accuracy: 88,
            stability_repeatability: 84,
          },
        },
      },
    })) as any,
    [],
  )

  assert.equal(result.passedDrillCount, 2)
  assert.equal(result.completed, false)
  assert.equal(result.gateStatus.technical, false)
})
