import test from 'node:test'
import assert from 'node:assert/strict'

import { buildQualityConfig } from '../perf/qualityHeuristics'

test('quality config includes audioAnalysisStride per mode', () => {
  const hi = buildQualityConfig('HIGH', 'MID')
  const bal = buildQualityConfig('BALANCED', 'MID')
  const lite = buildQualityConfig('LITE', 'LOW')

  assert.equal(hi.audioAnalysisStride, 1)
  assert.equal(bal.audioAnalysisStride, 2)
  assert.equal(lite.audioAnalysisStride, 3)

  assert.ok(hi.audioAnalysisStride <= bal.audioAnalysisStride)
  assert.ok(bal.audioAnalysisStride <= lite.audioAnalysisStride)
})
