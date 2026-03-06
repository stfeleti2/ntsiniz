import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const screens = [
  'src/app/screens/HomeScreen.tsx',
  'src/app/screens/DrillScreen.tsx',
  'src/app/screens/DrillResultScreen.tsx',
  'src/app/screens/PlaybackScreen.tsx',
]

const missing = []
for (const s of screens) {
  const p = path.join(root, s)
  const text = fs.readFileSync(p, 'utf8')
  const ok = text.includes('KillerLoopLayout') || text.includes('NextActionBar')
  if (!ok) missing.push(s)
}

if (missing.length) {
  console.error('⛔ "What next?" enforcement failed. Core loop screens must include KillerLoopLayout or NextActionBar:')
  for (const m of missing) console.error(' -', m)
  process.exit(1)
}
console.log('✅ NextActionBar present on core loop screens')
