import test from 'node:test'
import assert from 'node:assert/strict'

import { spacing, radius, typography, elevation } from '@/theme/tokens'

test('spacing tokens keep expected scale order', () => {
  const numericKeys = Object.keys(spacing)
    .filter((k) => /^\d+$/.test(k))
    .map((k) => Number(k))
    .sort((a, b) => a - b)

  assert.deepEqual(numericKeys, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assert.equal(spacing[4] > spacing[3], true)
})

test('radius and typography tokens are present for shared primitives', () => {
  assert.equal(radius[3] > radius[2], true)
  assert.equal(typeof typography.size.md, 'number')
  assert.equal(typeof typography.lineHeight.md, 'number')
  assert.equal(typeof typography.weight.semibold, 'string')
})

test('elevation tiers include neumorphic surface map', () => {
  assert.ok(elevation.neumorphic.flat)
  assert.ok(elevation.neumorphic.raised)
  assert.ok(elevation.neumorphic.inset)
  assert.ok(elevation.neumorphic.pressed)
  assert.ok(elevation.neumorphic.glass)
})

