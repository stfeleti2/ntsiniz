import Constants from 'expo-constants'

function readVersionFromConstants(): string | null {
  const cfg: any = (Constants as any).expoConfig ?? (Constants as any).manifest ?? (Constants as any).manifest2
  const v = cfg?.version
  if (typeof v === 'string' && v.trim()) return v.trim()
  return null
}

/**
 * Returns the app version as declared in app.config/app.json (Expo).
 *
 * Note: This is used for remote compatibility gates (min/max app version).
 */
export function getAppVersion(): string {
  return readVersionFromConstants() ?? '0.0.0'
}
