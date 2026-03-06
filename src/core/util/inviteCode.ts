import { fromByteArray, toByteArray } from 'base64-js'

const PREFIX = 'NTS1'

function checksum(payload: string): string {
  let h = 7
  for (let i = 0; i < payload.length; i++) h = (h * 31 + payload.charCodeAt(i)) % 36
  return h.toString(36).toUpperCase()
}

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  return fromByteArray(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(s: string): string | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    return new TextDecoder().decode(toByteArray(padded))
  } catch {
    return null
  }
}

export function makeInviteCode(userId: string): string {
  const payload = toBase64Url(userId)
  return `${PREFIX}-${payload}${checksum(payload)}`
}

export function parseInviteCode(input: string): { userId: string } | null {
  const raw = String(input ?? '').trim()
  const m = raw.match(/^NTS1-([A-Za-z0-9_-]+)$/)
  if (!m) return null

  const withCheck = m[1]
  if (withCheck.length < 2) return null
  const payload = withCheck.slice(0, -1)
  const got = withCheck.slice(-1).toUpperCase()
  if (checksum(payload) !== got) return null

  const userId = fromBase64Url(payload)
  if (!userId) return null
  return { userId }
}
