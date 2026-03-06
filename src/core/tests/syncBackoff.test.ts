import test from 'node:test'
import assert from 'node:assert/strict'

import { computeBackoffMs, MAX_SYNC_TRIES } from '../cloud/syncQueueRepo'

test('computeBackoffMs: increases and caps', () => {
  const a = computeBackoffMs(0)
  const b = computeBackoffMs(1)
  const c = computeBackoffMs(5)
  const d = computeBackoffMs(20)

  assert.ok(a >= 1000)
  assert.ok(b >= a)
  assert.ok(c >= b)
  // cap ~10 minutes + jitter
  assert.ok(d <= 10 * 60_000 + 500)
})

test('MAX_SYNC_TRIES: reasonable', () => {
  assert.ok(MAX_SYNC_TRIES >= 5)
  assert.ok(MAX_SYNC_TRIES <= 12)
})
