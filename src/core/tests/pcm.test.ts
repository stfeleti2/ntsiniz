import test from 'node:test'
import assert from 'node:assert/strict'

import { pcmBase64ToFloat32 } from '../audio/pcm'

function b64FromI16(vals: number[]) {
  const buf = Buffer.alloc(vals.length * 2)
  for (let i = 0; i < vals.length; i++) buf.writeInt16LE(vals[i]!, i * 2)
  return buf.toString('base64')
}

test('pcmBase64ToFloat32 decodes and can reuse output buffer', () => {
  const b64 = b64FromI16([0, 16384, -16384, 32767, -32768])

  const out1 = pcmBase64ToFloat32(b64)
  assert.equal(out1.length, 5)
  assert.equal(out1[0], 0)
  assert.ok(Math.abs(out1[1] - 0.5) < 1e-6)
  assert.ok(Math.abs(out1[2] + 0.5) < 1e-6)

  const out2 = pcmBase64ToFloat32(b64, out1)
  // Same reference reused
  assert.equal(out2, out1)
  assert.ok(Math.abs(out2[3] - (32767 / 32768)) < 1e-6)
  assert.equal(out2[4], -1)
})
