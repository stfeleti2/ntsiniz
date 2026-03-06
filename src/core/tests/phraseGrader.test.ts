import test from 'node:test'
import assert from 'node:assert/strict'
import { gradePhraseFromMetrics } from '../scoring/phraseGrader.js'

test('gradePhraseFromMetrics: perfect phrase', () => {
  const g = gradePhraseFromMetrics({ avgAbsCents: 8, wobbleCents: 7, voicedRatio: 0.9, timeToEnterMs: 800, confidenceAvg: 0.95 })
  assert.equal(g.label, 'perfect')
  assert.ok(g.score > 0.85)
})

test('gradePhraseFromMetrics: try again phrase', () => {
  const g = gradePhraseFromMetrics({ avgAbsCents: 60, wobbleCents: 38, voicedRatio: 0.35, timeToEnterMs: 4200, confidenceAvg: 0.9 })
  assert.equal(g.label, 'tryAgain')
  assert.ok(g.score < 0.55)
})
