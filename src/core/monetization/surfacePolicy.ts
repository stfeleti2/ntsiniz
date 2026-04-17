const BLOCKED_PASSIVE_MONETIZATION_SURFACES = new Set([
  'Welcome',
  'Onboarding',
  'PermissionsPrimer',
  'WakeYourVoice',
  'FirstWinResult',
  'Drill',
  'DrillResult',
  'Playback',
  'Recovery',
  'RangeSnapshot',
])

export function canShowPassiveMonetization(surface?: string | null): boolean {
  if (!surface) return false
  return !BLOCKED_PASSIVE_MONETIZATION_SURFACES.has(surface)
}

export function listBlockedPassiveMonetizationSurfaces(): string[] {
  return Array.from(BLOCKED_PASSIVE_MONETIZATION_SURFACES.values()).sort()
}
