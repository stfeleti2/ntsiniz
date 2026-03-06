/**
 * Optional native chunked WAV writer.
 *
 * Expo-managed builds: this module will not exist unless you add the optional
 * native implementation under `modules/expo-wav-file-writer` and run prebuild.
 *
 * When available, it enables true streaming writes (no base64, no whole-file
 * in-memory buffers).
 */

export type NativeWavWriter = {
  /** Returns device/native input audio capabilities when supported. */
  getInputAudioCapabilities?: () => Promise<{
    sampleRateHz: number
    channels: number
    ioBufferDurationMs: number
    supportedSampleRatesHz: number[]
    supportedChannelCounts: number[]
  }>

  /** Begin writing a WAV file to `path`. */
  open: (path: string, opts: { sampleRate: number; channels: number }) => Promise<void>

  /** Append PCM16LE chunk encoded as base64 (no JSON overhead in bridge). */
  appendPcm16leBase64: (pcmBase64: string) => Promise<{ peak: number; clipped: boolean } | void>

  /** Optional batch append to reduce bridge overhead. */
  appendPcm16leBase64Batch?: (chunks: string[]) => Promise<{ peak: number; clipped: boolean } | void>

  /** Finalize WAV headers. */
  finalize: (opts: { totalSamples: number }) => Promise<void>

  /** Abort and best-effort cleanup. */
  abort?: () => Promise<void>
}

export function getNativeWavWriter(): NativeWavWriter | null {
  try {
    // Preferred: bundled JS wrapper from our local Expo module package.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require('ntsiniz-wav-file-writer')
    const mod = (pkg?.default ?? pkg) as any
    if (mod?.open && mod?.appendPcm16leBase64 && mod?.finalize) return mod as NativeWavWriter

    // Fallback: direct native module (older shape).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require('expo-modules-core') as any
    const direct = requireNativeModule?.('WavFileWriter')
    if (direct?.openAsync) {
      return {
        getInputAudioCapabilities: direct.getInputAudioCapabilitiesAsync,
        open: (path, opts) => direct.openAsync(path, opts.sampleRate, opts.channels),
        appendPcm16leBase64: (b64) => direct.appendPcm16leBase64Async(b64),
        finalize: (opts) => direct.finalizeAsync(opts.totalSamples),
        abort: () => direct.abortAsync?.(),
      } as NativeWavWriter
    }
    return null
  } catch {
    return null
  }
}
