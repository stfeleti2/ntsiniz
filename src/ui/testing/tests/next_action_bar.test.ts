import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { render } from '../render'
import { NextActionBar } from '@/ui/components/NextActionBar'

test('NextActionBar renders title + primary button', () => {
  const r = render(
    React.createElement(NextActionBar, {
      title: 'What now?',
      subtitle: 'Do one small thing.',
      primaryLabel: 'Start',
      onPrimary: () => {},
    })
  )

  assert.ok(r.root.findByProps({ children: 'What now?' }))
  assert.ok(r.root.findByProps({ text: 'Start' }))
})
