import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'

export type MonetizationState = {
  dayKey: number
  rewardedCount: number
  interstitialCount: number
  lastRewardedAt?: number
  lastInterstitialAt?: number
  lastPaywallAt?: number
}

function todayKey() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function fresh(): MonetizationState {
  return { dayKey: todayKey(), rewardedCount: 0, interstitialCount: 0 }
}

export async function getMonetizationState(): Promise<MonetizationState> {
  const s = await getSettings()
  const raw: any = (s as any).monetization
  if (!raw || raw.dayKey !== todayKey()) return fresh()
  return { ...fresh(), ...raw }
}

export async function updateMonetizationState(patch: Partial<MonetizationState>) {
  const s = await getSettings()
  const cur = await getMonetizationState()
  const next = { ...cur, ...patch, dayKey: todayKey() }
  ;(s as any).monetization = next
  await upsertSettings(s)
  return next
}
