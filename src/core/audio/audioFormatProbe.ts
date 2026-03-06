import { getNativeWavWriter } from './nativeWavWriter'

export type AudioInputFormat = {
  /** Preferred/native sample rate for capture. */
  sampleRateHz: number
  /** Back-compat alias for older call sites. */
  sampleRate: number
  /** Preferred channel count (we usually capture mono for pitch). */
  channels: number
  /** Device I/O buffer duration (ms). */
  ioBufferDurationMs: number
  /** Back-compat alias for older call sites. */
  bufferDurationMs: number
  /** Best-effort candidate sample rates (not guaranteed enumerable on all platforms). */
  supportedSampleRatesHz: number[]
  /** Best-effort supported channel counts. */
  supportedChannelCounts: number[]
}

let _cache: { value: AudioInputFormat; atMs: number } | null = null

/** Invalidate cached probe results (call after route changes). */
export function invalidateAudioInputFormatCache() {
  _cache = null
}

/**
 * Probe audio input capabilities.
 *
 * - Uses optional native module when available.
 * - Falls back to safe defaults when running in Expo Go / web / tests.
 */
export async function probeAudioInputFormat(): Promise<AudioInputFormat> {
  // Cache for a short window to avoid repeated native calls.
  const now = Date.now()
  if (_cache && now - _cache.atMs < 5_000) return _cache.value

  const mod = getNativeWavWriter()
  if (mod?.getInputAudioCapabilities) {
    try {
      const caps = await mod.getInputAudioCapabilities()
      // Ensure stable ordering + de-dupe.
      const uniq = (xs: number[]) => Array.from(new Set(xs)).filter((n) => Number.isFinite(n) && n > 0)
      const out = {
        sampleRateHz: caps.sampleRateHz || 48000,
        sampleRate: caps.sampleRateHz || 48000,
        channels: caps.channels || 1,
        ioBufferDurationMs: caps.ioBufferDurationMs || 20,
        bufferDurationMs: caps.ioBufferDurationMs || 20,
        supportedSampleRatesHz: uniq([caps.sampleRateHz || 48000, ...(caps.supportedSampleRatesHz ?? [48000, 44100])]),
        supportedChannelCounts: uniq([caps.channels || 1, ...(caps.supportedChannelCounts ?? [1])]),
      }
      _cache = { value: out, atMs: now }
      return out
    } catch {
      // Fall through.
    }
  }

  const fallback = {
    sampleRateHz: 48000,
    sampleRate: 48000,
    channels: 1,
    ioBufferDurationMs: 20,
    bufferDurationMs: 20,
    supportedSampleRatesHz: [48000, 44100],
    supportedChannelCounts: [1],
  }

  _cache = { value: fallback, atMs: now }
  return fallback
}
