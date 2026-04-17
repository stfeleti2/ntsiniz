import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const rawProgram = JSON.parse(readFileSync('src/content/guided_journey/production.en.json', 'utf8'))

test('V6 stage assessments load the multi-gate benchmark structure', () => {
  const assessment = rawProgram.assessments.find((item: any) => item.stage_id === 'S1')
  assert.ok(assessment)
  assert.equal(assessment.type, 'multi_gate_benchmark_v6')
  assert.ok(assessment.sections.length >= 6)
  assert.ok(assessment.promotion_rules.some((rule: string) => rule.includes('technical + transfer + health')))
  assert.ok(assessment.benchmark_drill_ids.length >= 3)
})

test('V6 rubric dimensions are available for assessment summaries', () => {
  const names = rawProgram.assessment_rubric_dimensions.map((item: any) => item.name)
  assert.ok(names.includes('technique_accuracy'))
  assert.ok(names.includes('efficiency_health'))
  assert.ok(names.includes('transfer_application'))
})
