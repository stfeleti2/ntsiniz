import { toByteArray } from 'base64-js'

/**
 * Decode a PCM16 mono WAV file (like the ones we write in attemptWavRecorder)
 * into a quantized waveform (0..100) suitable for fast UI rendering.
 *
 * Uses dynamic import for expo-file-system/legacy so Node-based tests can still typecheck.
 */
export async function decodeWavWaveform(
  uri: string,
  bars = 72,
): Promise<{ waveformPeaks: number[]; durationMs: number; sampleRate: number } | null> {
  if (!uri) return null

  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }

  try {
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
    const bytes = toByteArray(b64)
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    // quick sanity
    if (bytes.byteLength < 44) return null
    if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WAVE') return null

    const parsed = findWavDataChunk(dv, bytes)
    if (!parsed) return null
    const { sampleRate, dataOffset, dataBytes } = parsed

    const numSamples = Math.floor(dataBytes / 2)
    const durationMs = sampleRate > 0 ? Math.round((numSamples / sampleRate) * 1000) : 0
    const waveformPeaks = quantizePeaks(downsamplePeaksFromI16(dv, dataOffset, numSamples, bars))
    return { waveformPeaks, durationMs, sampleRate }
  } catch {
    return null
  }
}

/**
 * Decode PCM16 mono WAV into Float32 samples.
 * Used for dev-only repeatability analysis.
 */
export async function decodeWavSamples(uri: string): Promise<{ samples: Float32Array; sampleRate: number } | null> {
  if (!uri) return null

  let FileSystem: any
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return null
  }

  try {
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
    const bytes = toByteArray(b64)
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    if (bytes.byteLength < 44) return null
    if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WAVE') return null

    const parsed = findWavDataChunk(dv, bytes)
    if (!parsed) return null
    const { sampleRate, dataOffset, dataBytes } = parsed
    const numSamples = Math.floor(dataBytes / 2)
    const out = new Float32Array(numSamples)
    for (let i = 0; i < numSamples; i++) {
      const v = dv.getInt16(dataOffset + i * 2, true)
      out[i] = v / 32767
    }
    return { samples: out, sampleRate }
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
  // Our encoder writes a fixed PCM header, but we scan chunks to be safe.
  let sampleRate = 44100
  let off = 12
  while (off + 8 <= bytes.byteLength) {
    const id = ascii(bytes, off, 4)
    const size = dv.getUint32(off + 4, true)
    const body = off + 8

    if (id === 'fmt ') {
      // PCM fmt chunk
      if (body + 16 <= bytes.byteLength) {
        sampleRate = dv.getUint32(body + 4, true)
      }
    }

    if (id === 'data') {
      return { sampleRate, dataOffset: body, dataBytes: size }
    }

    off = body + size + (size % 2) // chunk padding
  }

  // Fallback: assume standard 44-byte header
  const dataOffset = 44
  const dataBytes = Math.max(0, bytes.byteLength - dataOffset)
  return { sampleRate, dataOffset, dataBytes }
}

function downsamplePeaksFromI16(dv: DataView, dataOffset: number, numSamples: number, bars: number): number[] {
  if (bars <= 0) return []
  const out: number[] = []
  if (numSamples <= 0) return new Array(bars).fill(0)

  const step = numSamples / bars
  for (let i = 0; i < bars; i++) {
    const start = Math.floor(i * step)
    const end = Math.floor((i + 1) * step)
    let m = 0
    for (let j = start; j < Math.min(numSamples, Math.max(end, start + 1)); j++) {
      const v = dv.getInt16(dataOffset + j * 2, true)
      const a = Math.abs(v)
      if (a > m) m = a
    }
    out.push(m / 32767)
  }
  return out
}

function quantizePeaks(peaks01: number[]): number[] {
  const max = Math.max(0.0001, ...peaks01)
  return peaks01.map((p) => {
    const n = Math.max(0, Math.min(1, p / max))
    return Math.round(n * 100)
  })
}
