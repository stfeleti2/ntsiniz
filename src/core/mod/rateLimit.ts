const buckets = new Map<string, number[]>()

/**
 * Very small in-memory rate limit for local safety actions.
 * Not meant for abuse prevention at internet scale.
 */
export function allowAction(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const arr = buckets.get(key) ?? []
  const fresh = arr.filter((t) => now - t < windowMs)
  if (fresh.length >= limit) {
    buckets.set(key, fresh)
    return false
  }
  fresh.push(now)
  buckets.set(key, fresh)
  return true
}
