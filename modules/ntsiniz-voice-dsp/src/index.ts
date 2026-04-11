import { requireNativeModule } from 'expo-modules-core'

export type DspSuppressionMode = 'off' | 'conservativeAdaptive'
export type SignalQualityGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'blocked'

export type NativeDspFrame = {
  vadProb: number
  noiseFloorDb: number
  snrDb: number
  clipping: boolean
  voicedRatio: number
  signalQuality: SignalQualityGrade
}

export type VoiceDspNativeModule = {
  createSession(opts: { sampleRate: number; suppressionMode: DspSuppressionMode }): string
  processFrame(sessionId: string, pcmBase64: string, sampleRate: number): NativeDspFrame
  closeSession(sessionId: string): void
  createSessionAsync(opts: { sampleRate: number; suppressionMode: DspSuppressionMode }): Promise<string>
  processFrameAsync(sessionId: string, pcmBase64: string, sampleRate: number): Promise<NativeDspFrame>
  closeSessionAsync(sessionId: string): Promise<void>
}

const Native = requireNativeModule<VoiceDspNativeModule>('NtsinizVoiceDsp')

export default Native
