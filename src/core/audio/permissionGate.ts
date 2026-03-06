let cached: boolean | null = null

/**
 * We cache ONLY the "granted" state.
 *
 * Rationale:
 * - If permission is denied, the user might enable it later in Settings.
 * - Caching `false` would lock the app into a permanent "denied" state until restart.
 *
 * This gate keeps behavior deterministic for tests (prompt-at-most-once during a session)
 * while still allowing a later re-check after the user changes OS settings.
 */
export async function ensurePermissionOnce(ensure: () => Promise<boolean>): Promise<boolean> {
  if (cached === true) return true
  const ok = await ensure()
  if (ok) cached = true
  return ok
}

export function resetPermissionGate() {
  cached = null
}
