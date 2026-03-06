import fs from 'node:fs'
import path from 'node:path'

function die(msg) {
  console.error(msg)
  process.exit(1)
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function normalize(v) {
  const main = String(v ?? '').trim().split('-')[0] ?? ''
  const parts = main.split('.').map((p) => {
    const n = Number.parseInt(String(p).replace(/[^0-9]/g, ''), 10)
    return Number.isFinite(n) ? n : 0
  })
  while (parts.length < 3) parts.push(0)
  return parts.slice(0, 3)
}

function compare(a, b) {
  const aa = normalize(a)
  const bb = normalize(b)
  for (let i = 0; i < 3; i++) {
    if (aa[i] < bb[i]) return -1
    if (aa[i] > bb[i]) return 1
  }
  return 0
}

const repoRoot = process.cwd()
const examplePath = path.join(repoRoot, 'docs/remote_config/remote_config.example.json')
if (!fs.existsSync(examplePath)) die(`Missing ${examplePath}`)

const raw = JSON.parse(fs.readFileSync(examplePath, 'utf8'))
if (!isPlainObject(raw)) die('remote config example must be a JSON object')

// Minimal shape validation that matches src/core/config/remoteConfigSchema.ts.
if (raw.flags != null && !isPlainObject(raw.flags)) die('flags must be an object')
if (raw.killSwitch != null && !isPlainObject(raw.killSwitch)) die('killSwitch must be an object')
if (raw.compat != null && !isPlainObject(raw.compat)) die('compat must be an object')
if (raw.security != null && !isPlainObject(raw.security)) die('security must be an object')

const minV = raw.compat?.minAppVersion
const maxV = raw.compat?.maxAppVersion
if (typeof minV === 'string' && typeof maxV === 'string') {
  if (compare(minV, maxV) === 1) {
    die(`compat.minAppVersion (${minV}) must be <= compat.maxAppVersion (${maxV})`)
  }
}

console.log('✅ remote config example is valid')
