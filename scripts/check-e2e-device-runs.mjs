import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const p = path.join(root, 'docs/e2e/DEVICE_RUNS.md')

if (!fs.existsSync(p)) {
  console.error('⛔ docs/e2e/DEVICE_RUNS.md missing')
  process.exit(1)
}

const txt = fs.readFileSync(p, 'utf8')

// In day-to-day dev, this is informational. In RELEASE builds, it must be real.
const strict = process.env.RELEASE === '1' || process.env.STRICT_E2E_RUNS === '1'

if (!strict) {
  console.log('ℹ️ check-e2e-device-runs: skipped (set RELEASE=1 or STRICT_E2E_RUNS=1 to enforce)')
  process.exit(0)
}

if (/\bTODO\b|TBD|PLACEHOLDER/i.test(txt)) {
  console.error('⛔ docs/e2e/DEVICE_RUNS.md contains placeholders (TODO/TBD). Fill real device runs.')
  process.exit(1)
}

// Require at least 2 PASS results.
const passCount = (txt.match(/Result:\s*PASS\b/gi) || []).length
if (passCount < 2) {
  console.error(`⛔ Need at least 2 real PASS runs recorded. Found ${passCount}.`)
  process.exit(1)
}

console.log('✅ E2E device runs present')
