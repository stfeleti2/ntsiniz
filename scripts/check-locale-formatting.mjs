import fs from 'node:fs'
import path from 'node:path'

/**
 * Locale formatting guard.
 *
 * In user-facing UI code, numbers/dates/currency should go through
 * src/core/i18n/intl.ts helpers so formatting is consistent per-locale.
 */

const root = process.cwd()

const scanRoots = [
  path.join(root, 'src/app'),
  path.join(root, 'src/ui'),
]

const exts = new Set(['.ts', '.tsx', '.js', '.jsx'])

const banned = [
  { re: /\btoFixed\s*\(/g, label: 'toFixed(' },
  { re: /\btoLocaleString\s*\(/g, label: 'toLocaleString(' },
]

const allowFile = (p) =>
  // Locale helpers themselves.
  p.includes(path.sep + 'src' + path.sep + 'core' + path.sep + 'i18n' + path.sep) ||
  // Dev-only screens and diagnostic overlays may format numbers freely.
  p.includes(path.sep + 'src' + path.sep + 'app' + path.sep + 'screens' + path.sep + 'Dev') ||
  p.includes('AudioTortureLabScreen') ||
  // Geometry formatting in charts/ghost overlays is not locale-sensitive.
  p.includes(path.sep + 'src' + path.sep + 'ui' + path.sep + 'charts' + path.sep) ||
  p.includes(path.sep + 'src' + path.sep + 'ui' + path.sep + 'ghost' + path.sep) ||
  // Scripts.
  p.includes(path.sep + 'scripts' + path.sep)

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (exts.has(path.extname(p))) out.push(p)
  }
  return out
}

const files = scanRoots.flatMap((d) => walk(d))
const offenders = []

for (const file of files) {
  if (allowFile(file)) continue
  const text = fs.readFileSync(file, 'utf8')
  for (const b of banned) {
    b.re.lastIndex = 0
    if (b.re.test(text)) offenders.push({ file: path.relative(root, file), rule: b.label })
  }
}

if (offenders.length) {
  console.error('⛔ Locale formatting check failed. Use formatNumber/formatDate helpers instead of ad-hoc formatting.')
  for (const o of offenders.slice(0, 60)) console.error('-', o.rule, 'in', o.file)
  if (offenders.length > 60) console.error(`...and ${offenders.length - 60} more`)
  process.exit(1)
}

console.log('✅ locale formatting OK')
