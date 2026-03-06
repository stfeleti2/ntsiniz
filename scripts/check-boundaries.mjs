import fs from 'node:fs'
import path from 'node:path'

/**
 * Lightweight boundary enforcement without adding third‑party tooling.
 *
 * Boundaries:
 * - `src/core/**` must not import anything from `src/app/**`.
 *   Core must remain UI-agnostic to prevent bundle bloat and dependency tangles.
 */

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')

const violations = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.isFile() && (p.endsWith('.ts') || p.endsWith('.tsx'))) checkFile(p)
  }
}

const importRe = /from\s+['"]([^'"]+)['"]/g

function checkFile(absPath) {
  const rel = path.relative(ROOT, absPath)
  if (!rel.startsWith(`src${path.sep}core${path.sep}`)) return

  const txt = fs.readFileSync(absPath, 'utf8')
  let m
  while ((m = importRe.exec(txt))) {
    const spec = m[1]

    // Disallow any alias-based app import.
    if (spec.startsWith('@/app/')) violations.push({ file: rel, spec })

    // Disallow relative path that reaches app.
    if (spec.includes('/app/') || spec.includes('\\app\\')) violations.push({ file: rel, spec })
  }
}

walk(SRC)

if (violations.length) {
  console.error(`\nBoundary violations: core importing app`) 
  for (const v of violations) console.error(`- ${v.file} -> ${v.spec}`)
  console.error(`\nFix: move shared logic into src/core/** and keep src/app/** UI-only.`)
  process.exit(1)
}

console.log('Boundary check OK')
