import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

function listFiles(dir: string): string[] {
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...listFiles(p))
    else if (ent.isFile() && /\.(ts|tsx)$/.test(ent.name)) out.push(p)
  }
  return out
}

test('no TODO/TBD/FIXME markers in app screens', () => {
  const screensDir = path.join(process.cwd(), 'src', 'app', 'screens')
  const files = listFiles(screensDir)
  assert.ok(files.length > 0, 'expected screens to exist')
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8')
    assert.ok(!/\b(TODO|TBD|FIXME)\b/i.test(src), `marker found in ${path.relative(process.cwd(), f)}`)
  }
})
