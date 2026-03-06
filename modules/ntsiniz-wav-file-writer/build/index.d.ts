import { requireNativeModule } from 'expo-modules-core'

export type InputAudioCapabilities = {
  sampleRateHz: number
  channels: number
  ioBufferDurationMs: number
  supportedSampleRatesHz: number[]
  supportedChannelCounts: number[]
  // Best-effort diagnostics
  routeDescription?: string
  probedAtMs?: number
}

export type WavFileWriterNativeModule = {
  getInputAudioCapabilitiesAsync: () => Promise<InputAudioCapabilities>
  openWriterAsync: (path: string, sampleRate: number, channels: number) => Promise<string>
  appendPcm16leBase64Async: (writerId: string, pcmBase64: string) => Promise<{ peak: number; clipped: boolean }>
  appendPcm16leBase64BatchAsync?: (writerId: string, chunks: string[]) => Promise<{ peak: number; clipped: boolean }>
  finalizeAsync: (writerId: string, totalSamples: number) => Promise<void>
  abortAsync: (writerId: string) => Promise<void>
}

declare const _default: {
  getInputAudioCapabilities: () => ReturnType<WavFileWriterNativeModule['getInputAudioCapabilitiesAsync']>
  open: (path: string, opts: { sampleRate: number; channels: number }) => Promise<void>
  appendPcm16leBase64: (pcmBase64: string) => ReturnType<WavFileWriterNativeModule['appendPcm16leBase64Async']>
  appendPcm16leBase64Batch: (chunks: string[]) => Promise<{ peak: number; clipped: boolean }>
  finalize: (opts: { totalSamples: number }) => Promise<void>
  abort: () => Promise<void>

  openWriter: (path: string, opts: { sampleRate: number; channels: number }) => ReturnType<WavFileWriterNativeModule['openWriterAsync']>
  appendFor: (writerId: string, pcmBase64: string) => ReturnType<WavFileWriterNativeModule['appendPcm16leBase64Async']>
  appendBatchFor: (writerId: string, chunks: string[]) => Promise<{ peak: number; clipped: boolean }>
  finalizeFor: (writerId: string, totalSamples: number) => ReturnType<WavFileWriterNativeModule['finalizeAsync']>
  abortFor: (writerId: string) => ReturnType<WavFileWriterNativeModule['abortAsync']>
}

export default _default
