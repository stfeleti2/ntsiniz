import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const p = path.join(root, 'src/app/telemetry/events.ts')
const text = fs.readFileSync(p, 'utf8')

// Very conservative banned substrings for payload keys.
const banned = [
  'email', 'e-mail', 'phone', 'mobile', 'address', 'street', 'gps', 'lat', 'lng',
  'name', 'surname', 'firstName', 'lastName', 'idNumber', 'passport',
]

// Allowlist patterns where the word appears but is not PII (keep tiny).
const allow = [
  'displayName', // used publicly in competitions; still non-PII by policy (user-chosen)
]

const offenders = []
for (const b of banned) {
  if (allow.some(a => a.toLowerCase() === b.toLowerCase())) continue
  const re = new RegExp(`\\b${b}\\b`, 'i')
  if (re.test(text)) offenders.push(b)
}

if (offenders.length) {
  console.error('⛔ Telemetry PII lint failed. Banned key(s) found in src/app/telemetry/events.ts:', offenders.join(', '))
  console.error('If intentional and non-PII, rename the key or add an explicit allowlist entry in scripts/check-telemetry-pii.mjs.')
  process.exit(1)
}
console.log('✅ telemetry PII lint OK')
