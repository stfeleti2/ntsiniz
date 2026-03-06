import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { render } from '../render'
import { RecordingOverlay } from '../../patterns/RecordingOverlay'
import { RecorderHUD } from '../../patterns/RecorderHUD'
import { WaveformCard } from '../../patterns/WaveformCard'

test('RecordingOverlay stop button calls onStop', () => {
  let stop = 0
  const r = render(
    React.createElement(RecordingOverlay, {
      visible: true,
      elapsedLabel: '00:01',
      onStop: () => (stop += 1),
      onPause: () => {},
      mode: 'pill',
      testID: 'rec',
    }),
  )
  const stopBtn = r.root.findByProps({ testID: 'rec.stop' })
  stopBtn.props.onPress()
  assert.equal(stop, 1)
})

test('RecorderHUD renders', () => {
  const r = render(React.createElement(RecorderHUD, { elapsedLabel: '00:02', testID: 'hud' }))
  const node = r.root.findByProps({ testID: 'hud' })
  assert.ok(node)
})

test('WaveformCard renders title', () => {
  const r = render(React.createElement(WaveformCard, { title: 'Take 1', testID: 'wf' }))
  const title = r.root.findByProps({ children: 'Take 1' })
  assert.ok(title)
})
