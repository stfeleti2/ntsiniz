import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveFeedbackPlan, applyFeedbackPlanToDrill, isTransferLikeDrillId } from '../coaching/feedbackPolicy.js'

test('resolveFeedbackPlan: beginner stays forgiving but tightens over weeks', () => {
  const w1 = resolveFeedbackPlan({ track: 'beginner', week: 1, base: null })
  const w12 = resolveFeedbackPlan({ track: 'beginner', week: 12, base: null })
  assert.equal(w1.mode, 'REALTIME_FULL')
  assert.ok(w1.bandwidthCents >= w12.bandwidthCents)
  assert.ok(w12.bandwidthCents >= 18)
})

test('resolveFeedbackPlan: advanced reduces overlay progressively; OFF_POST only for transfer later weeks', () => {
  const w2core = resolveFeedbackPlan({ track: 'advanced', week: 2, base: null, segment: 'core' })
  const w8core = resolveFeedbackPlan({ track: 'advanced', week: 8, base: null, segment: 'core' })
  const w10core = resolveFeedbackPlan({ track: 'advanced', week: 10, base: null, segment: 'core' })
  const w10transfer = resolveFeedbackPlan({ track: 'advanced', week: 10, base: null, segment: 'transfer' })
  assert.equal(w2core.mode, 'FADED')
  assert.equal(w8core.mode, 'BANDWIDTH_ONLY')
  assert.equal(w10core.mode, 'BANDWIDTH_ONLY')
  assert.equal(w10transfer.mode, 'OFF_POST')
})

test('resolveFeedbackPlan: lesson base mode is respected and bandwidth is tightened by progression', () => {
  const p = resolveFeedbackPlan({ track: 'advanced', week: 10, base: { mode: 'FADED', bandwidthCents: 40, fadeAfterSec: 1.5 } })
  assert.equal(p.mode, 'FADED')
  assert.equal(p.bandwidthCents, 28.75)
  assert.ok(Math.abs((p.fadeAfterSec ?? 0) - 1.14) < 0.001)
})

test('applyFeedbackPlanToDrill clones drill and applies tune window', () => {
  const d = { id: 'x', title: 't', type: 'sustain', level: 1, tuneWindowCents: 25, holdMs: 1000, countdownMs: 800 }
  const p = { mode: 'REALTIME_FULL', bandwidthCents: 50 }
  const out = applyFeedbackPlanToDrill(d as any, p as any)
  assert.notEqual(out, d)
  assert.equal(out.tuneWindowCents, 50)
})

test('isTransferLikeDrillId detects phrase/melody drills', () => {
  assert.equal(isTransferLikeDrillId('song_phrase_twinkle_a'), true)
  assert.equal(isTransferLikeDrillId('melody_1'), true)
  assert.equal(isTransferLikeDrillId('sustain_a3_steady'), false)
})
