import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'src/core')

const allowTag = 'ALLOW_TODO_CORE'
const badTokens = ['TODO', 'FIXME', 'TBD']

function walk(d) {
  const out = []
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name)
    if (ent.isDirectory()) out.push(...walk(p))
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) out.push(p)
  }
  return out
}

const offenders = []
for (const f of walk(dir)) {
  const rel = path.relative(root, f)
  const txt = fs.readFileSync(f, 'utf8')
  for (const tok of badTokens) {
    const idx = txt.indexOf(tok)
    if (idx !== -1) {
      const around = txt.slice(Math.max(0, idx-80), idx+80)
      if (!around.includes(allowTag)) offenders.push({ rel, tok })
    }
  }
}

if (offenders.length) {
  console.error('⛔ TODO/FIXME/TBD found in src/core without allow tag:', allowTag)
  for (const o of offenders.slice(0, 40)) console.error(` - ${o.rel} (${o.tok})`)
  if (offenders.length > 40) console.error(` ...and ${offenders.length-40} more`)
  process.exit(1)
}
console.log('✅ no TODO/FIXME/TBD in core')
