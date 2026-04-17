import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'

import { colors } from '../../tokens/colors'
import { elevation } from '../../tokens/elevation'
import { render } from '../render'
import { Surface } from '../../primitives/Surface'

test('neumorphic tokens expose semantic surface colors', () => {
  assert.equal(typeof colors.surfaceBase, 'string')
  assert.equal(typeof colors.surfaceRaised, 'string')
  assert.equal(typeof colors.surfaceInset, 'string')
  assert.equal(typeof colors.surfaceGlass, 'string')
  assert.equal(typeof colors.accentLavender, 'string')
  assert.equal(typeof colors.accentCyan, 'string')
})

test('neumorphic elevation map is available', () => {
  assert.ok(elevation.neumorphic.raised.shadowOpacity > 0)
  assert.ok(elevation.neumorphic.pressed.shadowRadius > 0)
  assert.ok(elevation.neumorphic.inset.elevation >= 0)
})

test('surface accepts neumorphic depth + glass tone', () => {
  const tree = render(
    React.createElement(Surface, {
      tone: 'glass',
      depth: 'pressed',
      accentRole: 'primary',
      testID: 'surface.test',
      children: null,
    }),
  )
  const node = tree.root.findByProps({ testID: 'surface.test' })
  assert.ok(node)
})
