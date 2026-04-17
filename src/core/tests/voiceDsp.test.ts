import test from 'node:test'
import assert from 'node:assert/strict'

import { createVoiceDspSession } from '../audio/dsp/voiceDsp'

test('voice DSP estimates healthy SNR and VAD for steady voiced frames', async () => {
  const dsp = createVoiceDspSession({ sampleRate: 48000, suppressionMode: 'conservativeAdaptive' })
  let ts = 1_000

  for (let i = 0; i < 50; i += 1) {
    dsp.pushFrame({
      sampleRate: 48000,
      timestampMs: ts,
      samples: constantFrame(960, 0.002),
      routeFingerprint: 'built_in|mic',
    })
    ts += 20
  }

  let last = dsp.pushFrame({
    sampleRate: 48000,
    timestampMs: ts,
    samples: sineFrame(960, 220, 48000, 0.2),
    routeFingerprint: 'built_in|mic',
  })
  ts += 20

  for (let i = 0; i < 70; i += 1) {
    last = dsp.pushFrame({
      sampleRate: 48000,
      timestampMs: ts,
      samples: sineFrame(960, 220, 48000, 0.2),
      routeFingerprint: 'built_in|mic',
    })
    ts += 20
  }

  const summary = dsp.summary()
  assert.ok(summary.avgSnrDb > 3)
  assert.ok(summary.avgVadProb > 0.35)
  assert.ok(last.voicedRatio > 0.2)
  assert.ok(last.signalQuality === 'good' || last.signalQuality === 'excellent')
  await dsp.close()
})

test('voice DSP marks clipping and route changes deterministically', async () => {
  const dsp = createVoiceDspSession({ sampleRate: 48000, suppressionMode: 'conservativeAdaptive' })
  let ts = 2_000

  const clipped = dsp.pushFrame({
    sampleRate: 48000,
    timestampMs: ts,
    samples: constantFrame(960, 1),
    routeFingerprint: 'built_in|mic',
  })
  ts += 20
  assert.equal(clipped.clipping, true)

  const changed = dsp.pushFrame({
    sampleRate: 48000,
    timestampMs: ts,
    samples: constantFrame(960, 0.005),
    routeFingerprint: 'bluetooth|mic',
  })

  assert.equal(changed.routeHealth, 'changed')
  await dsp.close()
})

function constantFrame(n: number, value: number) {
  const out = new Float32Array(n)
  out.fill(value)
  return out
}

function sineFrame(n: number, freq: number, sampleRate: number, amp: number) {
  const out = new Float32Array(n)
  for (let i = 0; i < n; i += 1) {
    out[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate) * amp
  }
  return out
}
