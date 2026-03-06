// Ultra-light safety guardrails (offline).
// Not a replacement for real server-side moderation.

const BANNED = [
  'nazi',
  'hitler',
  'kkk',
  'rape',
  'kill yourself',
  'suicide',
  'faggot',
  'nigger',
  'cunt',
]

export function normalize(s: string) {
  return (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

export function containsBannedText(s: string) {
  const n = normalize(s)
  return BANNED.some((w) => n.includes(w))
}

export function validateDisplayName(name: string): { ok: boolean; error?: string } {
  const n = (name ?? '').trim()
  if (n.length < 3) return { ok: false, error: 'Name is too short.' }
  if (n.length > 24) return { ok: false, error: 'Name is too long.' }
  if (containsBannedText(n)) return { ok: false, error: 'Please choose a different name.' }
  // avoid obvious links
  if (/https?:\/\//i.test(n) || /\bwww\./i.test(n)) return { ok: false, error: 'No links in names.' }
  return { ok: true }
}

export function validateComment(body: string): { ok: boolean; error?: string } {
  const n = (body ?? '').trim()
  if (!n) return { ok: false, error: 'Comment is empty.' }
  if (n.length > 160) return { ok: false, error: 'Comment is too long.' }
  if (containsBannedText(n)) return { ok: false, error: 'Please rephrase that.' }
  return { ok: true }
}

export function sanitizeText(body: string): string {
  let out = (body ?? '').trim()
  // basic redaction of banned tokens
  for (const w of BANNED) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig')
    out = out.replace(re, '***')
  }
  return out
}
