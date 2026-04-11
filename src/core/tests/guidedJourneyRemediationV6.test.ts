import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const rawProgram = JSON.parse(readFileSync('src/content/guided_journey/production.en.json', 'utf8'))

test('V6 remediation bundles map diagnosis tags to real bundle IDs', () => {
  const bundle = rawProgram.remediation_rules.remediation_bundles.find((item: any) => item.triggers.includes('always_flat'))
  assert.ok(bundle)
  assert.equal(bundle.id, 'RB2')
  assert.ok(bundle.lesson_pattern.some((item: string) => item.includes('pitch_slide')))
})

test('V6 remediation profiles expose coach-tip templates', () => {
  const coachTip = rawProgram.remediation_rules.diagnosis_profiles.find((item: any) => item.tag === 'wrong_direction_interval')?.coach_tip_template
  assert.ok(coachTip)
  assert.ok(coachTip?.includes('up or down'))
})
