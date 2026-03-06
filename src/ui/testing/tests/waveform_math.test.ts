import test from 'node:test'
import assert from 'node:assert/strict'

import { progressFromX, xFromProgress } from '../../patterns/waveformMath'

test('waveformMath: progressFromX respects padding', () => {
  const width = 200
  const pad = 10
  // left padding should map to 0
  assert.equal(progressFromX(10, width, pad), 0)
  // right padding should map to 1
  assert.equal(progressFromX(190, width, pad), 1)
  // center (100) should be ~0.5
  assert.ok(Math.abs(progressFromX(100, width, pad) - 0.5) < 1e-6)
})

test('waveformMath: xFromProgress is inverse of progressFromX (within clamp)', () => {
  const width = 300
  const pad = 12
  for (const p of [0, 0.1, 0.5, 0.9, 1]) {
    const x = xFromProgress(p, width, pad)
    const p2 = progressFromX(x, width, pad)
    assert.ok(Math.abs(p2 - p) < 1e-6)
  }
})
