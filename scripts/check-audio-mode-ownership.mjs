import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const src = path.join(root, 'src')

function walk(dir) {
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walk(p))
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) out.push(p)
  }
  return out
}

const files = walk(src)
const offenders = []

for (const f of files) {
  const rel = path.relative(root, f)
  if (rel === 'src/core/audio/session.ts') continue
  const text = fs.readFileSync(f, 'utf8')
  if (text.includes('setAudioModeAsync(') || text.includes('.setAudioModeAsync(')) {
    offenders.push(rel)
  }
}

if (offenders.length) {
  console.error('⛔ Audio mode ownership violated. Only src/core/audio/session.ts may call Audio.setAudioModeAsync.')
  for (const f of offenders) console.error(' -', f)
  process.exit(1)
}
console.log('✅ audio mode ownership OK')
