import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { render } from '../render'

import { AttemptListModule } from '@/ui/modules/attempts/AttemptListModule'

test('AttemptListModule renders empty state', () => {
  const tree = render(
    <AttemptListModule attempts={[]} testID="attempt.list" />,
  )
  assert.ok(tree.root.findByProps({ testID: 'attempt.list' }))
})
