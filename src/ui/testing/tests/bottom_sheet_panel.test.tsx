import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'

import { render } from '../render'
import { BottomSheetPanel } from '@/components/ui/molecules'
import { Heading } from '@/components/ui/atoms'

test('bottom sheet panel renders and exposes content', () => {
  const tree = render(
    <BottomSheetPanel snapPoints={['40%']} testID="ui.bottom-sheet">
      <Heading level={3}>Panel</Heading>
    </BottomSheetPanel>,
  )

  const panel = tree.root.findByProps({ testID: 'ui.bottom-sheet' })
  assert.ok(panel)
  assert.ok(tree.root.findByType(Heading))
})

