import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const rawProgram = JSON.parse(
  readFileSync('src/content/guided_journey/production.en.json', 'utf8'),
)

test('guided journey production pack has the expected chapter structure', () => {
  assert.equal(rawProgram.routes.length, 5)
  assert.equal(rawProgram.stages.length, 5)
  assert.equal(rawProgram.lessons.length, 30)
  assert.ok(rawProgram.drills.length >= 150)
  assert.equal(rawProgram.routes.find((route: any) => route.id === 'R5')?.primary_stage_ids?.[0], 'S2')
  assert.ok(Array.isArray(rawProgram.load_tiers?.tiers))
  assert.ok(Array.isArray(rawProgram.assessment_rubric_dimensions))
  assert.ok(Array.isArray(rawProgram.pressure_ladders?.S1))
  assert.ok(Array.isArray(rawProgram.remediation_rules?.remediation_bundles))
})

test('guided journey lessons carry route-specific drill slices', () => {
  const lesson = rawProgram.lessons.find((item: any) => item.id === 'S1_L01')
  assert.ok(lesson)
  const drills = rawProgram.drills.filter((drill: any) => lesson.drill_ids.includes(drill.id))
  const routeIds = Array.from(new Set(drills.map((drill: any) => drill.route_id))).sort()

  assert.deepEqual(routeIds, ['R1'])
})

test('guided journey lessons and drills expose V6 metadata fields', () => {
  const lesson = rawProgram.lessons.find((item: any) => item.id === 'S1_L01')
  const drill = rawProgram.drills.find((item: any) => item.id === 'D001')
  const assessment = rawProgram.assessments.find((item: any) => item.id === 'A_S1')

  assert.ok(Array.isArray(lesson.lesson_outcomes))
  assert.equal(typeof lesson.mastery_gate?.technical, 'string')
  assert.equal(typeof lesson.load_tier_target, 'string')
  assert.equal(typeof drill.load_tier, 'string')
  assert.equal(typeof drill.learning_phase, 'string')
  assert.equal(typeof drill.pressure_ladder_step, 'string')
  assert.ok(Array.isArray(assessment.sections))
  assert.ok(Array.isArray(assessment.promotion_rules))
})
