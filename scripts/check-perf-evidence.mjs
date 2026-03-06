import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const p = path.join(root, 'docs/PERF_EVIDENCE.md')
if (!fs.existsSync(p)) {
  console.error('⛔ docs/PERF_EVIDENCE.md missing')
  process.exit(1)
}
const txt = fs.readFileSync(p, 'utf8')
const placeholders = ['TBD', 'TODO', '___', '[fill', 'N/A (fill)']
const found = placeholders.filter(k => txt.includes(k))
const strict = process.env.RELEASE === '1' || process.env.CI_RELEASE === '1'
if (strict && found.length) {
  console.error('⛔ PERF_EVIDENCE still has placeholders:', found.join(', '))
  process.exit(1)
}
console.log(strict ? '✅ perf evidence complete' : '✅ perf evidence gate skipped (set RELEASE=1 to enforce)')
