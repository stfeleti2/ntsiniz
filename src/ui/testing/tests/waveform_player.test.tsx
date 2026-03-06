import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { render } from '../render'
import { WaveformPlayerModule } from '../../modules/playback/WaveformPlayerModule'

test('WaveformPlayerModule renders waveform and buttons', () => {
  const r = render(
    React.createElement(WaveformPlayerModule, {
      testID: 'player',
      loading: false,
      peaks: [10, 40, 80, 20],
      progress: 0.25,
      progressLabel: '00:01 / 00:04',
      isPlaying: false,
      onToggle: () => {},
      onRestart: () => {},
      onSeek: () => {},
    }),
  )

  assert.ok(r.root.findByProps({ testID: 'player.waveform' }))
  assert.ok(r.root.findByProps({ testID: 'player.toggle' }))
  assert.ok(r.root.findByProps({ testID: 'player.restart' }))
})
