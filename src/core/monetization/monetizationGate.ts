import { getMonetizationState } from './monetizationState'
import { getAudioSupervisorSnapshot } from '@/core/audio/audioSupervisor'

export type MonetizationDecision = {
  canRewarded: boolean
  canInterstitial: boolean
  reason?: string
}

export async function decideMonetization(): Promise<MonetizationDecision> {
  const s = await getMonetizationState()
  const audio = getAudioSupervisorSnapshot?.() as any

  // Never show ads while audio is active.
  if (audio?.state && ['RECORDING', 'PLAYING', 'RECOVERING'].includes(audio.state)) {
    return { canRewarded: false, canInterstitial: false, reason: 'audio_active' }
  }

  const now = Date.now()
  const canRewarded = s.rewardedCount < 2 && (s.lastRewardedAt ? now - s.lastRewardedAt > 10 * 60 * 1000 : true)
  const canInterstitial =
    s.interstitialCount < 3 && (s.lastInterstitialAt ? now - s.lastInterstitialAt > 8 * 60 * 1000 : true)

  return { canRewarded, canInterstitial }
}
