import test from 'node:test'
import assert from 'node:assert/strict'

import { canShowPassiveMonetization, listBlockedPassiveMonetizationSurfaces } from '../monetization/surfacePolicy'

test('passive monetization is blocked on trust-critical loop surfaces', () => {
  const blocked = listBlockedPassiveMonetizationSurfaces()
  for (const surface of ['Welcome', 'PermissionsPrimer', 'WakeYourVoice', 'Drill', 'Playback', 'Recovery']) {
    assert.equal(blocked.includes(surface), true, `expected ${surface} to be blocked`)
    assert.equal(canShowPassiveMonetization(surface), false, `${surface} must not host passive monetization`)
  }
})

test('passive monetization is allowed on session-closure surfaces', () => {
  assert.equal(canShowPassiveMonetization('SessionSummary'), true)
  assert.equal(canShowPassiveMonetization('DayComplete'), true)
  assert.equal(canShowPassiveMonetization('WeeklyReport'), true)
})
