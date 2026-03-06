import test from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

function readAllText(dir: string): string {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(readAllText(p))
    else if (entry.isFile()) out.push(fs.readFileSync(p, 'utf8'))
  }
  return out.join('\n')
}

test('legal docs/text contain no placeholder markers', () => {
  const repoRoot = path.resolve(process.cwd())
  const legalDocs = path.join(repoRoot, 'docs', 'legal')
  const legalText = path.join(repoRoot, 'src', 'app', 'legal')

  const src = readAllText(legalDocs) + '\n' + readAllText(legalText)
  assert.ok(!/\b(TODO|TBD|FIXME)\b/i.test(src), 'Legal docs/text still contain TODO/TBD/FIXME markers')
})
