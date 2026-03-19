import test from 'node:test'
import assert from 'node:assert/strict'

import { adaptiveReducer, DEFAULT_ADAPTIVE_STATE } from '../guidedJourney/adaptiveCore.js'

test('adaptive reducer turns on help mode after repeated low scores', () => {
  let state = DEFAULT_ADAPTIVE_STATE
  for (let index = 0; index < 5; index += 1) {
    state = adaptiveReducer(state, {
      type: 'ATTEMPT_RECORDED',
      payload: {
        score: 42,
        drillId: `D${index}`,
        family: 'match_note',
        meanAbsCents: 34,
        biasCents: -20,
        voicedRatio: 0.44,
        timestamp: Date.now() + index,
      },
    })
  }

  assert.equal(state.helpMode, true)
  assert.ok(state.voiceProfile.tags.includes('always_flat'))
})

test('adaptive reducer recommends route-biased family when tags are quiet', () => {
  const state = adaptiveReducer(
    { ...DEFAULT_ADAPTIVE_STATE, routeId: 'R3' },
    {
      type: 'ATTEMPT_RECORDED',
      payload: {
        score: 80,
        drillId: 'D100',
        family: 'match_note',
        meanAbsCents: 9,
        biasCents: 2,
        voicedRatio: 0.9,
        timestamp: Date.now(),
      },
    },
  )

  assert.equal(state.lastRecommendedFamily, 'confidence_rep')
})
