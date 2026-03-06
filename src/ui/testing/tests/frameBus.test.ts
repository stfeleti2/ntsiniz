import test from 'node:test'
import assert from 'node:assert/strict'

import { FrameBus } from '@/core/audio/frameBus'

test('FrameBus drops oldest frames when queue exceeds maxQueue', () => {
  const bus = new FrameBus<number>({ maxQueue: 3, maxPerTick: 1 })
  const drained: number[] = []

  // Push 5 items quickly; queue max is 3 so 2 should be dropped.
  for (let i = 0; i < 5; i++) {
    bus.push(i, (x) => drained.push(x))
  }

  const st = bus.getStats()
  assert.equal(st.maxQueue, 3)
  assert.equal(st.dropped, 2)
})
