import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getCloudConfig, isCloudConfigured } from './config'
import { secureStoreAdapter } from './secureStoreStorage'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isCloudConfigured()) return null
  if (client) return client
  const cfg = getCloudConfig()
  client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: {
      storage: secureStoreAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      // RN fetch
      fetch: (input: any, init?: any) => fetch(input, init),
    },
  })
  return client
}
