import { requireNativeModule } from 'expo-modules-core'

// Typed wrapper for the native module.
export type InputAudioCapabilities = {
  sampleRateHz: number
  channels: number
  ioBufferDurationMs: number
  supportedSampleRatesHz: number[]
  supportedChannelCounts: number[]
}

export type WavFileWriterNativeModule = {
  getInputAudioCapabilitiesAsync: () => Promise<InputAudioCapabilities>
  openAsync: (path: string, sampleRate: number, channels: number) => Promise<void>
  appendPcm16leBase64Async: (pcmBase64: string) => Promise<{ peak: number; clipped: boolean }>
  finalizeAsync: (totalSamples: number) => Promise<void>
  abortAsync: () => Promise<void>
}

const mod = requireNativeModule<WavFileWriterNativeModule>('WavFileWriter')

// Maintain back-compat with the in-app wrapper.
export default {
  getInputAudioCapabilities: () => mod.getInputAudioCapabilitiesAsync(),
  open: (path: string, opts: { sampleRate: number; channels: number }) => mod.openAsync(path, opts.sampleRate, opts.channels),
  appendPcm16leBase64: (pcmBase64: string) => mod.appendPcm16leBase64Async(pcmBase64),
  finalize: (opts: { totalSamples: number }) => mod.finalizeAsync(opts.totalSamples),
  abort: () => mod.abortAsync(),
}
