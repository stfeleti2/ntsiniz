import test from 'node:test'
import assert from 'node:assert/strict'

import { summarizeGuidedAttemptEvidence } from '../guidedJourney/v6Selectors'

test('guided evidence summary aggregates rubric dimensions, blocked gates, and family usage', () => {
  const summary = summarizeGuidedAttemptEvidence([
    {
      id: 'att_1',
      createdAt: Date.now(),
      sessionId: 'sess_1',
      drillId: 'host_1',
      score: 84,
      metrics: {
        guidedJourney: {
          family: 'match_note',
          blockedBy: ['technical gate'],
          rubricDimensions: {
            technique_accuracy: 86,
            stability_repeatability: 78,
          },
        },
      },
    },
    {
      id: 'att_2',
      createdAt: Date.now() + 1,
      sessionId: 'sess_1',
      drillId: 'host_2',
      score: 76,
      metrics: {
        guidedJourney: {
          family: 'match_note',
          blockedBy: ['technical gate', 'transfer gate'],
          rubricDimensions: {
            technique_accuracy: 82,
            transfer_application: 69,
          },
        },
      },
    },
    {
      id: 'att_3',
      createdAt: Date.now() + 2,
      sessionId: 'sess_1',
      drillId: 'host_3',
      score: 88,
      metrics: {
        guidedJourney: {
          family: 'melody_echo',
          rubricDimensions: {
            stylism_communication: 91,
            transfer_application: 81,
          },
        },
      },
    },
  ] as any)

  assert.equal(summary.averageScore, 83)
  assert.equal(summary.strongestDimensions[0]?.id, 'stylism_communication')
  assert.equal(summary.weakestDimensions[0]?.id, 'transfer_application')
  assert.equal(summary.blockedGates[0]?.id, 'technical gate')
  assert.equal(summary.recentFamilies[0]?.id, 'match_note')
})
