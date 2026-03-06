import { toByteArray, fromByteArray } from 'base64-js'
import { wavHeader } from './wav'

type WavPcm16 = {
  sampleRate: number
  pcm: Int16Array
}

/**
 * Mix two PCM16 mono WAV files (like the files created by attemptWavRecorder).
 *
 * This is intentionally lightweight and offline-first.
 * - Assumes mono PCM16.
 * - If sample rates differ, it will refuse (better than producing wrong audio).
 */
export async function mixWav16MonoFiles(params: {
  aUri: string
  bUri: string
  outUri: string
  gainA?: number
  gainB?: number
}): Promise<{ outUri: string; sampleRate: number; durationMs: number } | null> {
  const { aUri, bUri, outUri, gainA = 0.7, gainB = 0.7 } = params
  if (!aUri || !bUri || !outUri) return null

  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }

  const a = await readWavPcm16Mono(FileSystem, aUri)
  const b = await readWavPcm16Mono(FileSystem, bUri)
  if (!a || !b) return null
  if (a.sampleRate !== b.sampleRate) return null

  const n = Math.max(a.pcm.length, b.pcm.length)
  const out = new Int16Array(n)
  for (let i = 0; i < n; i++) {
    const va = i < a.pcm.length ? a.pcm[i] : 0
    const vb = i < b.pcm.length ? b.pcm[i] : 0
    // Mix in float space to avoid overflow, then clamp.
    const mixed = Math.round(va * gainA + vb * gainB)
    out[i] = clampI16(mixed)
  }

  const header = wavHeader({ sampleRate: a.sampleRate, numSamples: out.length })
  const pcmBytes = new Uint8Array(out.buffer)
  const bytes = new Uint8Array(header.byteLength + pcmBytes.byteLength)
  bytes.set(header, 0)
  bytes.set(pcmBytes, header.byteLength)

  const b64 = fromByteArray(bytes)
  await FileSystem.writeAsStringAsync(outUri, b64, { encoding: FileSystem.EncodingType.Base64 })

  const durationMs = a.sampleRate > 0 ? Math.round((out.length / a.sampleRate) * 1000) : 0
  return { outUri, sampleRate: a.sampleRate, durationMs }
}

async function readWavPcm16Mono(FileSystem: any, uri: string): Promise<WavPcm16 | null> {
  try {
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
    const bytes = toByteArray(b64)
    if (bytes.byteLength < 44) return null
    // basic RIFF/WAVE sanity
    if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WAVE') return null

    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const parsed = findWavDataChunk(dv, bytes)
    if (!parsed) return null
    const { sampleRate, dataOffset, dataBytes } = parsed
    const numSamples = Math.floor(dataBytes / 2)
    const pcm = new Int16Array(numSamples)
    for (let i = 0; i < numSamples; i++) {
      pcm[i] = dv.getInt16(dataOffset + i * 2, true)
    }
    return { sampleRate, pcm }
  } catch {
    return null
  }
}

function ascii(bytes: Uint8Array, off: number, len: number) {
  let s = ''
  for (let i = 0; i < len; i++) s += String.fromCharCode(bytes[off + i] ?? 0)
  return s
}

function findWavDataChunk(
  dv: DataView,
  bytes: Uint8Array,
): { sampleRate: number; dataOffset: number; dataBytes: number } | null {
  let sampleRate = 44100
  let off = 12
  while (off + 8 <= bytes.byteLength) {
    const id = ascii(bytes, off, 4)
    const size = dv.getUint32(off + 4, true)
    const body = off + 8

    if (id === 'fmt ') {
      if (body + 16 <= bytes.byteLength) {
        sampleRate = dv.getUint32(body + 4, true)
      }
    }
    if (id === 'data') {
      return { sampleRate, dataOffset: body, dataBytes: size }
    }
    off = body + size + (size % 2)
  }
  // fallback: assume standard 44-byte header
  const dataOffset = 44
  const dataBytes = Math.max(0, bytes.byteLength - dataOffset)
  return { sampleRate, dataOffset, dataBytes }
}

function clampI16(v: number): number {
  if (v > 32767) return 32767
  if (v < -32768) return -32768
  return v
}
