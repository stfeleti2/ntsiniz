export type CloudConfig = {
  supabaseUrl: string
  supabaseAnonKey: string
  cloudAutoSync: boolean
}

function getConstantsExtra(): Record<string, any> {
  try {
    // Keep this lazy for node-based core tests.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-constants')
    const constants: any = mod?.default ?? mod
    return constants?.expoConfig?.extra ?? constants?.manifest?.extra ?? {}
  } catch {
    return {}
  }
}

export function getCloudConfig(): CloudConfig {
  const extra = getConstantsExtra()
  return {
    supabaseUrl: (extra?.supabaseUrl ?? '').trim(),
    supabaseAnonKey: (extra?.supabaseAnonKey ?? '').trim(),
    cloudAutoSync: extra?.cloudAutoSync === true,
  }
}

export function isCloudConfigured(): boolean {
  const c = getCloudConfig()
  return !!c.supabaseUrl && !!c.supabaseAnonKey
}
