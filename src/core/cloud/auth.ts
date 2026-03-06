import { isCloudConfigured } from './config'
import { getSupabase } from './supabase'
import { setIdentity, getIdentity } from './identityRepo'
import { ensureCloudSelfId } from './migrateIdentity'
import { enableCloud } from '@/core/config/flags'
import { logger } from '@/core/observability/logger'

export type CloudUser = { id: string; email?: string | null }

let cachedUser: CloudUser | null = null
let inited = false

export function getCachedCloudUser(): CloudUser | null {
  return cachedUser
}

export async function initCloudAuth(): Promise<void> {
  if (inited) return
  inited = true
  if (!enableCloud()) {
    cachedUser = null
    return
  }
  if (!isCloudConfigured()) {
    cachedUser = null
    return
  }

  const supabase = getSupabase()
  if (!supabase) return

  // restore from local identity record first (fast path)
  const ident = await getIdentity().catch(() => null)
  if (ident?.remoteUserId) cachedUser = { id: ident.remoteUserId, email: ident.email }

  const { data } = await supabase.auth.getSession()
  const u = data.session?.user
  if (u) {
    cachedUser = { id: u.id, email: u.email }
    await setIdentity({ remoteUserId: u.id, email: u.email ?? null }).catch((e) => logger.warn('suppressed error', e))
    await ensureCloudSelfId(u.id, u.email ?? null).catch((e) => logger.warn('suppressed error', e))
  } else {
    cachedUser = null
    await setIdentity({ remoteUserId: null, email: null }).catch((e) => logger.warn('suppressed error', e))
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    const user = session?.user
    if (user) {
      cachedUser = { id: user.id, email: user.email }
      await setIdentity({ remoteUserId: user.id, email: user.email ?? null }).catch((e) => logger.warn('suppressed error', e))
      await ensureCloudSelfId(user.id, user.email ?? null).catch((e) => logger.warn('suppressed error', e))
    } else {
      cachedUser = null
      await setIdentity({ remoteUserId: null, email: null }).catch((e) => logger.warn('suppressed error', e))
    }
  })
}

export async function requestEmailOtp(email: string): Promise<void> {
  if (!isCloudConfigured()) throw new Error('Cloud sync is not configured.')
  const supabase = getSupabase()
  if (!supabase) throw new Error('Cloud sync is not configured.')
  const e = email.trim().toLowerCase()
  if (!e || !e.includes('@')) throw new Error('Enter a valid email.')
  const { error } = await supabase.auth.signInWithOtp({ email: e })
  if (error) throw new Error(error.message)
}

export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  if (!isCloudConfigured()) throw new Error('Cloud sync is not configured.')
  const supabase = getSupabase()
  if (!supabase) throw new Error('Cloud sync is not configured.')
  const e = email.trim().toLowerCase()
  const t = token.trim()
  if (!t) throw new Error('Enter the code from your email.')
  const { data, error } = await supabase.auth.verifyOtp({ email: e, token: t, type: 'email' })
  if (error) throw new Error(error.message)
  const user = data.user
  if (user) {
    cachedUser = { id: user.id, email: user.email }
    await setIdentity({ remoteUserId: user.id, email: user.email ?? null }).catch((e) => logger.warn('suppressed error', e))
    await ensureCloudSelfId(user.id, user.email ?? null).catch((e) => logger.warn('suppressed error', e))
  }
}

export async function signOutCloud(): Promise<void> {
  const supabase = getSupabase()
  if (supabase) await supabase.auth.signOut().catch((e) => logger.warn('suppressed error', e))
  cachedUser = null
  await setIdentity({ remoteUserId: null, email: null }).catch((e) => logger.warn('suppressed error', e))
}

export async function isSignedIn(): Promise<boolean> {
  await initCloudAuth().catch((e) => logger.warn('suppressed error', e))
  return !!cachedUser
}