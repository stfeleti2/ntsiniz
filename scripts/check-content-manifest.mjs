import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const MANIFEST = path.resolve('src/content/manifests/content.manifest.json')
if (!fs.existsSync(MANIFEST)) {
  console.error('Missing manifest', MANIFEST)
  process.exit(1)
}

const before = fs.readFileSync(MANIFEST, 'utf8')

// Regenerate into a temp file (do NOT overwrite the real manifest; signature depends on it).
const TMP = path.resolve('src/content/manifests/.content.manifest.tmp.json')
try {
  execSync(`CONTENT_MANIFEST_OUT=${TMP} node scripts/gen-content-manifest.mjs`, { stdio: 'inherit' })
  const after = fs.readFileSync(TMP, 'utf8')

function stripGeneratedAt(s) {
  try {
    const j = JSON.parse(s)
    j.generatedAt = 'STRIPPED'
    return JSON.stringify(j)
  } catch {
    return s
  }
}

  if (stripGeneratedAt(before) !== stripGeneratedAt(after)) {
    console.error('Content manifest is out of date. Run: npm run gen:content-manifest then npm run sign:content-manifest, and commit.')
    process.exit(1)
  }
} finally {
  try {
    fs.unlinkSync(TMP)
  } catch {}
}



// Also ensure the static Metro content index is up-to-date.
const INDEX = path.resolve('src/content/contentIndex.ts')
if (!fs.existsSync(INDEX)) {
  console.error('Missing content index. Run: node scripts/gen-content-index.mjs')
  process.exit(1)
}
const idx = fs.readFileSync(INDEX, 'utf8')
try {
  const man = JSON.parse(before)
  const missing = []
  for (const e of man.entries || []) {
    if (typeof e.file !== 'string') continue
    // contentIndex maps keys as JSON strings, so search for the quoted file path.
    const needle = JSON.stringify(e.file)
    if (!idx.includes(needle)) missing.push(e.file)
  }
  if (missing.length) {
    console.error('contentIndex.ts is missing entries:', missing.slice(0, 10))
    console.error('Run: node scripts/gen-content-index.mjs and commit the result.')
    process.exit(1)
  }
} catch (e) {
  console.error('Failed to validate contentIndex.ts against manifest', e)
  process.exit(1)
}

console.log('check:content-manifest OK')
