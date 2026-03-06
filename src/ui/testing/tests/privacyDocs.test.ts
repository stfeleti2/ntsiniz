import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('privacy docs contain no TODO/TBD/FIXME markers', () => {
  const root = process.cwd()
  const p = path.join(root, 'docs', 'privacy', 'DATA_MAP.md')
  const src = fs.readFileSync(p, 'utf8')
  assert.ok(!/\b(TODO|TBD|FIXME)\b/i.test(src), 'DATA_MAP.md still contains TODO/TBD/FIXME markers')
})
