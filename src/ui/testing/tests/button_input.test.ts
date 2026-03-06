import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { render } from '../render'
import { Button } from '../../components/kit/Button'
import { Input } from '../../components/kit/Input'

test('Button renders label', () => {
  const r = render(React.createElement(Button, { label: 'Go', onPress: () => {}, testID: 'btn' }))
  const label = r.root.findByProps({ children: 'Go' })
  assert.ok(label)
})

test('Button disabled blocks press', () => {
  let pressed = 0
  const r = render(React.createElement(Button, { label: 'Go', onPress: () => (pressed += 1), disabled: true, testID: 'btn' }))
  const btn = r.root.findByProps({ testID: 'btn' })
  assert.equal(btn.props.disabled, true)
})

test('Input calls onChangeText', () => {
  let last = ''
  const r = render(
    React.createElement(Input, {
      value: '',
      onChangeText: (v) => (last = v),
      placeholder: 'Type',
      testID: 'input',
    }),
  )
  const input = r.root.findByProps({ testID: 'input' })
  input.props.onChangeText('abc')
  assert.equal(last, 'abc')
})
