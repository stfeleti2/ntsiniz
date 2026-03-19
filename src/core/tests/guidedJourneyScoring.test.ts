import test from 'node:test'
import assert from 'node:assert/strict'

import { scoreGuidedAttempt } from '../guidedJourney/scoringAdapter.js'

test('guided scoring adapter returns a pass band for a strong match-note attempt', () => {
  const result = scoreGuidedAttempt({
    drillId: 'D001',
    metrics: {
      drillType: 'match_note',
      avgAbsCents: 8,
      meanCents: 1,
      wobbleCents: 7,
      voicedRatio: 0.92,
      confidenceAvg: 0.88,
      timeToEnterMs: 420,
      overshootRate: 0.04,
    } as any,
  })

  assert.equal(result.family, 'match_note')
  assert.equal(result.passed, true)
  assert.ok(result.finalScore >= 72)
})

test('guided scoring adapter caps low-confidence results', () => {
  const result = scoreGuidedAttempt({
    drillId: 'D001',
    metrics: {
      drillType: 'match_note',
      avgAbsCents: 10,
      meanCents: 0,
      wobbleCents: 8,
      voicedRatio: 0.9,
      confidenceAvg: 0.22,
      timeToEnterMs: 500,
      overshootRate: 0.05,
    } as any,
  })

  assert.ok(result.finalScore <= 45)
})
