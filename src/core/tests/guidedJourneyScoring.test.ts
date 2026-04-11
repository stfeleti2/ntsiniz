import test from 'node:test'
import assert from 'node:assert/strict'

import { scoreGuidedAttempt } from '../guidedJourney/scoringAdapter'

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
    assessmentEvidence: { technical: true, transfer: true, health: true },
    pressureLadderStep: 'single note with light visual reward',
  })

  assert.equal(result.family, 'match_note')
  assert.equal(result.passed, true)
  assert.ok(result.finalScore >= 72)
  assert.ok((result.rubricDimensions.technique_accuracy ?? 0) >= 72)
  assert.equal(result.gateStatus.transfer, true)
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

test('guided scoring adapter emits blocked gates for weak transfer reps', () => {
  const result = scoreGuidedAttempt({
    drillId: 'D999',
    metrics: {
      drillType: 'melody_echo',
      avgAbsCents: 28,
      meanCents: -12,
      wobbleCents: 26,
      voicedRatio: 0.62,
      confidenceAvg: 0.58,
      timeToEnterMs: 1600,
      melodyHitRate: 0.42,
      contourHitRate: 0.48,
    } as any,
    assessmentEvidence: { transfer: true, styleOrCommunication: true },
    scoringLogic: {
      rubricDimensions: ['technique_accuracy', 'transfer_application', 'stylism_communication'],
      styleOrCommunicationWeight: 0.25,
    },
    masteryThreshold: 80,
    pressureLadderStep: 'one-take stylism rep',
  })

  assert.equal(result.passed, false)
  assert.ok(result.blockedBy.includes('technical gate') || result.blockedBy.includes('transfer gate'))
  assert.ok((result.rubricDimensions.transfer_application ?? 0) > 0)
})

test('guided scoring adapter treats advanced families as fully supported', () => {
  const result = scoreGuidedAttempt({
    drillId: 'D201',
    metrics: {
      drillType: 'melody_echo',
      avgAbsCents: 16,
      meanCents: -4,
      wobbleCents: 12,
      voicedRatio: 0.86,
      confidenceAvg: 0.8,
      timeToEnterMs: 820,
      melodyHitRate: 0.74,
      contourHitRate: 0.78,
    } as any,
    packFamily: 'phrase_sing',
    assessmentEvidence: { transfer: true, styleOrCommunication: true },
    masteryThreshold: 75,
  })

  assert.equal(result.family, 'phrase_sing')
  assert.equal(result.supported, true)
  assert.ok(result.finalScore >= 70)
  assert.ok((result.rubricDimensions.stylism_communication ?? 0) > 0)
})
