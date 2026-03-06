import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { computeEntryHashFromObject } from '../content/manifest.js'

type Manifest = { schema: number; generatedAt: string; algo?: string; entries: { file: string; sha256: string }[] }

test('content manifest entries match stable hash of bundled JSON', () => {
  const manifestPath = path.resolve(process.cwd(), 'src/content/manifests/content.manifest.json')
  const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest
  assert.ok(m.schema >= 2)

  for (const e of m.entries) {
    const abs = path.resolve(process.cwd(), 'src/content', e.file)
    const obj = JSON.parse(fs.readFileSync(abs, 'utf8'))
    const h = computeEntryHashFromObject(obj)
    assert.equal(h, e.sha256, `hash mismatch for ${e.file}`)
  }
})
