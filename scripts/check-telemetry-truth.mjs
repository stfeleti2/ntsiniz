import fs from 'node:fs'
import path from 'node:path'

/**
 * Telemetry truth gate.
 *
 * CI must fail if the code-defined event list drifts from docs.
 * - Code source: src/app/telemetry/events.ts
 * - Docs source: docs/privacy/TELEMETRY_EVENTS.md
 */

const root = process.cwd()

const eventsTs = path.join(root, 'src/app/telemetry/events.ts')
const docsMd = path.join(root, 'docs/privacy/TELEMETRY_EVENTS.md')

if (!fs.existsSync(eventsTs)) {
  console.error('⛔ telemetry truth check failed: missing', eventsTs)
  process.exit(1)
}
if (!fs.existsSync(docsMd)) {
  console.error('⛔ telemetry truth check failed: missing', docsMd)
  process.exit(1)
}

const code = fs.readFileSync(eventsTs, 'utf8')
const docs = fs.readFileSync(docsMd, 'utf8')

// Extract union literals from `TelemetryEventName = | 'a' | 'b'`.
const eventNames = [...code.matchAll(/\|\s*'([^']+)'/g)].map((m) => m[1]).filter(Boolean)

if (!eventNames.length) {
  console.error('⛔ telemetry truth check failed: could not parse event names from src/app/telemetry/events.ts')
  process.exit(1)
}

const missingInDocs = []
for (const ev of eventNames) {
  if (!docs.includes('`' + ev + '`')) missingInDocs.push(ev)
}

// Also catch stale docs: events listed in docs but not in code.
const docsEvents = [...docs.matchAll(/-\s*`([^`]+)`/g)].map((m) => m[1]).filter(Boolean)
const staleInDocs = docsEvents.filter((d) => !eventNames.includes(d))

if (missingInDocs.length || staleInDocs.length) {
  console.error('⛔ telemetry truth check failed.')
  if (missingInDocs.length) {
    console.error('Missing in docs/privacy/TELEMETRY_EVENTS.md:', missingInDocs.join(', '))
  }
  if (staleInDocs.length) {
    console.error('Stale in docs (present in docs but not in code):', staleInDocs.join(', '))
  }
  console.error('Fix: update docs/privacy/TELEMETRY_EVENTS.md to match src/app/telemetry/events.ts')
  process.exit(1)
}

console.log('✅ telemetry truth OK')
