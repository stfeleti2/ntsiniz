import { getDb, exec, query } from '@/core/storage/db'
import { isCloudConfigured } from '@/core/cloud/config'
import { getSupabase } from '@/core/cloud/supabase'
import { coreError } from '@/core/util/errors'
import { safeValidateRemoteConfig, type RemoteConfigPayload } from './remoteConfigSchema'
import { safeJsonParse } from '@/core/utils/safeJson'

export async function getRemoteConfig(): Promise<RemoteConfigPayload> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT valueJson FROM remote_config WHERE key = 'root' LIMIT 1;`, [])
  if (!rows[0]) return {}
  try {
    return safeValidateRemoteConfig(safeJsonParse(rows[0].valueJson, {}))
  } catch (e) {
    coreError('remote_config_parse', { e })
    return {}
  }
}

export async function setRemoteConfig(payload: RemoteConfigPayload): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  await exec(
    d,
    `INSERT INTO remote_config (key, valueJson, updatedAt) VALUES ('root', ?, ?)
     ON CONFLICT(key) DO UPDATE SET valueJson = excluded.valueJson, updatedAt = excluded.updatedAt;`,
    [JSON.stringify(payload), now],
  )
}

/**
 * Optional cloud refresh. Safe offline: returns cached config on any failure.
 * Expects a Supabase table: remote_config(key text primary key, value_json text, updated_at bigint).
 */
export async function refreshRemoteConfigFromCloud(): Promise<RemoteConfigPayload> {
  const cached = await getRemoteConfig()
  if (!isCloudConfigured()) return cached
  try {
    const sb = getSupabase()
    if (!sb) return cached
    const { data, error } = await sb.from('remote_config').select('value_json, updated_at').eq('key', 'root').limit(1).maybeSingle()
    if (error || !data?.value_json) return cached
    const parsed = safeJsonParse(data.value_json, {})
    const payload = safeValidateRemoteConfig(parsed)
    await setRemoteConfig(payload)
    return payload
  } catch (e) {
    coreError('remote_config_refresh', { e })
    return cached
  }
}
