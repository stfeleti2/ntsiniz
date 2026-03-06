import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('no console.warn in app screens (use reportUiError)', () => {
  const repoRoot = path.resolve(process.cwd())
  const screensDir = path.join(repoRoot, 'src', 'app', 'screens')
  const files = fs.readdirSync(screensDir).filter((f) => f.endsWith('.tsx'))
  const offenders: string[] = []
  for (const f of files) {
    const src = fs.readFileSync(path.join(screensDir, f), 'utf8')
    if (src.includes('console.warn')) offenders.push(f)
  }
  assert.equal(offenders.length, 0, `Found console.warn in: ${offenders.join(', ')}`)
})
