import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'

import { render } from '../render'
import { PremiumRangePracticePanel } from '../../onboarding/PremiumRangePracticePanel'

test('PremiumRangePracticePanel renders with minimal data', () => {
  const tree = render(
    <PremiumRangePracticePanel
      likelyZone="Alto"
      progress={0.35}
      traceValues={[0.4, 0.5, 0.55]}
      phraseChunks={['ah', 'aa', 'ah']}
      elapsedLabel="00:14"
      totalLabel="02:45"
    />,
  )

  const canvases = tree.root.findAllByType('Canvas' as any)
  assert.ok(canvases.length >= 1)
})
