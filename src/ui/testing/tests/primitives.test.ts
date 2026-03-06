import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { render } from '../render'
import { Box, Text } from '../../primitives'

test('Box renders with testID', () => {
  const r = render(React.createElement(Box, { testID: 'box' }))
  const node = r.root.findByProps({ testID: 'box' })
  assert.ok(node)
})

test('Text renders children', () => {
  const r = render(React.createElement(Text, { testID: 'text' }, 'hello'))
  const node = r.root.findByProps({ testID: 'text' })
  assert.equal(node.props.children, 'hello')
})
