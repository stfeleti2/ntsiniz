import test from 'node:test'
import assert from 'node:assert/strict'

import { profileForSingingLevel } from '../guidedJourney/singingLevel'

test('singing level maps to gentle high-guidance starter profile', () => {
  const profile = profileForSingingLevel('justStarting')
  assert.equal(profile.coachingMode, 'starter')
  assert.equal(profile.helperDensity, 'high')
  assert.equal(profile.routeHint, 'R1')
})

test('professional level maps to performer profile with lighter helper density', () => {
  const profile = profileForSingingLevel('professionalCoach')
  assert.equal(profile.coachingMode, 'performerCoach')
  assert.equal(profile.helperDensity, 'light')
  assert.equal(profile.routeHint, 'R5')
})

