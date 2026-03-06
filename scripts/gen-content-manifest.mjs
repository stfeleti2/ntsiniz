import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

function sha256Hex(inputUtf8) {
  return crypto.createHash('sha256').update(inputUtf8, 'utf8').digest('hex')
}
function sortValue(v) {
  if (Array.isArray(v)) return v.map(sortValue)
  if (v && typeof v === 'object') {
    const out = {}
    for (const k of Object.keys(v).sort()) out[k] = sortValue(v[k])
    return out
  }
  return v
}
function stableStringify(v) {
  return JSON.stringify(sortValue(v))
}

const ROOT = path.resolve(process.cwd(), 'src/content')
const OUT = process.env.CONTENT_MANIFEST_OUT
  ? path.resolve(process.cwd(), process.env.CONTENT_MANIFEST_OUT)
  : path.resolve(ROOT, 'manifests', 'content.manifest.json')

const files = []
function addDir(rel) {
  const dir = path.resolve(ROOT, rel)
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.json')) files.push(path.join(rel, f).replace(/\\/g, '/'))
  }
}
addDir('drills')
addDir('curriculum')
addDir('lessons')
addDir('competitions')

const entries = files.map((file) => {
  const abs = path.resolve(ROOT, file)
  const text = fs.readFileSync(abs, 'utf8')
  const raw = JSON.parse(text)
  const canonical = stableStringify(raw)
  return {
    id: file.replace(/\.json$/, ''),
    file,
    sha256: sha256Hex(canonical),
    sizeBytes: Buffer.byteLength(text, 'utf8'),
    canonical: 'stable-json-v1',
    version: 3,
  }
})

// Signing payload intentionally excludes generatedAt to keep signatures stable.
const signedPayload = { schema: 3, algo: 'sha256', entries }
const manifestId = sha256Hex(stableStringify(signedPayload))

const manifest = { ...signedPayload, generatedAt: new Date().toISOString(), manifestId }
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2))
console.log('Wrote', OUT, 'entries=', entries.length)
