#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// Scan all source to prevent false confidence when folders move.
const SCAN_DIRS = ['src']
const IGNORE = ['node_modules', 'dist-', '__tests__', '.test.', '/src/app/i18n/', '/src/core/scoring/phraseGrader.ts']
const STRICT_PATTERNS = ['/src/app/screens/', '/src/ui/', '/App.tsx']

function shouldIgnore(p) {
  const norm = p.replace(/\\/g, '/')
  return IGNORE.some((x) => norm.includes(x))
}

function walk(dir) {
  const out = []
  const abs = path.join(ROOT, dir)
  if (!fs.existsSync(abs)) return out
  const stack = [abs]
  while (stack.length) {
    const cur = stack.pop()
    const st = fs.statSync(cur)
    if (st.isDirectory()) {
      for (const ent of fs.readdirSync(cur)) stack.push(path.join(cur, ent))
    } else {
      out.push(cur)
    }
  }
  return out
}

const TEXT_NODE_RE = /<Text\b[^>]*>\s*([^<{][^<]*?)\s*<\/Text>/g
const ALERT_RE = /Alert\.alert\(\s*(['"`])([^\1]*?)\1/g
const PROP_RE = /(title|label|accessibilityLabel|placeholder)\s*=\s*(['"`])([^\2]*?)\2/g


function scanFile(file) {
  if (shouldIgnore(file)) return []
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return []
  const src = fs.readFileSync(file, 'utf8')
  const hits = []
  let m
  while ((m = TEXT_NODE_RE.exec(src))) {
    const raw = m[1].trim()
    if (!raw) continue
    if (/^[0-9:./\-\s]+$/.test(raw)) continue
    if (raw.startsWith('{') || raw.includes('{')) continue
    hits.push(raw)
  }
  const strict = STRICT_PATTERNS.some((p) => file.replace(/\\/g,'/').includes(p))

  // Alert.alert('literal'...)
  if (strict) while ((m = ALERT_RE.exec(src))) {
    const raw = (m[2] ?? '').trim()
    if (!raw) continue
    if (/^[0-9:./\-\s]+$/.test(raw)) continue
    hits.push(`Alert.alert: ${raw}`)
  }

  // Common props: title/label/accessibilityLabel/placeholder="literal"
  while ((m = PROP_RE.exec(src))) {
    const raw = (m[3] ?? '').trim()
    if (!raw) continue
    if (/^[0-9:./\-\s]+$/.test(raw)) continue
    hits.push(`${m[1]}: ${raw}`)
  }

  return hits
}


let total = 0
for (const dir of SCAN_DIRS) {
  for (const f of walk(dir)) {
    const hits = scanFile(f)
    if (hits.length) {
      total += hits.length
      console.error(`\n${path.relative(ROOT, f)}:`)
      for (const h of hits.slice(0, 20)) console.error(`  - ${h}`)
      if (hits.length > 20) console.error(`  ... +${hits.length - 20} more`)
    }
  }
}

if (total > 0) {
  console.error(`\nFound ${total} hardcoded UI string literals. Move them to i18n via t().`)
  process.exit(1)
}

console.log('check:i18n OK')