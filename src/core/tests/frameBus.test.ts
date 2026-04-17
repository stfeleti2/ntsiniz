import test from 'node:test'
import assert from 'node:assert/strict'
import { FrameBus } from '../audio/frameBus'

test('FrameBus drops oldest when maxQueue exceeded', async () => {
  const bus = new FrameBus<number>({ maxQueue: 5, maxPerTick: 10, preferAnimationFrame: false })

  const drained: number[] = []
  for (let i = 0; i < 20; i++) {
    bus.push(i, (v) => drained.push(v))
  }

  // Give scheduler time to drain.
  await new Promise((r) => setTimeout(r, 10))

  const st = bus.getStats()
  // Queue should be empty after drain.
  assert.equal(st.queue, 0)
  // We expect drops under heavy pressure.
  assert.ok(st.dropped > 0)

  // Because we drop oldest, drained values should skew toward later items.
  assert.ok(drained.includes(19))
  assert.ok(!drained.includes(0) || st.dropped >= 1)
})

test('FrameBus stop clears queue and prevents further drains', async () => {
  const bus = new FrameBus<number>({ maxQueue: 5, maxPerTick: 1, preferAnimationFrame: false })
  const drained: number[] = []
  bus.push(1, (v) => drained.push(v))
  bus.stop()
  bus.push(2, (v) => drained.push(v))
  await new Promise((r) => setTimeout(r, 10))
  assert.deepEqual(drained, [])
})
