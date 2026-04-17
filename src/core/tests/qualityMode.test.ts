import test from 'node:test'
import assert from 'node:assert/strict'

import {
  classifyDeviceTier,
  initialQualityForTier,
  shouldDegrade,
  shouldUpgrade,
  degradeMode,
  upgradeMode,
  buildQualityConfig,
} from '../perf/qualityHeuristics'

test('quality: device tier classification is stable', () => {
  const low = classifyDeviceTier({ platform: 'android', widthPx: 360, heightPx: 740, pixelRatio: 2 }) // ~4.2M
  const mid = classifyDeviceTier({ platform: 'android', widthPx: 411, heightPx: 891, pixelRatio: 2.5 }) // ~9.1M
  const high = classifyDeviceTier({ platform: 'ios', widthPx: 430, heightPx: 932, pixelRatio: 3 }) // ~36M

  assert.equal(low, 'LOW')
  assert.equal(mid, 'MID')
  assert.equal(high, 'HIGH')
})

test('quality: initial mode per tier', () => {
  assert.equal(initialQualityForTier('LOW'), 'LITE')
  assert.equal(initialQualityForTier('MID'), 'BALANCED')
  assert.equal(initialQualityForTier('HIGH'), 'HIGH')
})

test('quality: degrade/upgrade decisions', () => {
  assert.equal(degradeMode('HIGH'), 'BALANCED')
  assert.equal(degradeMode('BALANCED'), 'LITE')
  assert.equal(degradeMode('LITE'), 'LITE')

  assert.equal(upgradeMode('LITE', 'BALANCED'), 'BALANCED')
  assert.equal(upgradeMode('BALANCED', 'BALANCED'), 'BALANCED')
  assert.equal(upgradeMode('BALANCED', 'HIGH'), 'HIGH')
})

test('quality: thresholds do not flap instantly', () => {
  // High mode degrades at p95 >= 160.
  assert.equal(shouldDegrade({ p95StallMs: 159, worstStallMs: 0 }, 'HIGH'), false)
  assert.equal(shouldDegrade({ p95StallMs: 160, worstStallMs: 0 }, 'HIGH'), true)

  // Lite mode should only upgrade when p95 is reasonably low.
  assert.equal(shouldUpgrade({ p95StallMs: 260, worstStallMs: 0 }, 'LITE'), false)
  assert.equal(shouldUpgrade({ p95StallMs: 200, worstStallMs: 0 }, 'LITE'), true)
})

test('quality: config budgets differ by mode', () => {
  const hi = buildQualityConfig('HIGH', 'HIGH')
  const lite = buildQualityConfig('LITE', 'LOW')
  assert.ok(hi.waveformBars > lite.waveformBars)
  assert.ok(hi.shadowScale > lite.shadowScale)
})
