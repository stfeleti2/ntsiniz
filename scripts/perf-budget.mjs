#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// Budgets (override via env):
// - PERF_BUDGET_CORE_BYTES: compiled core logic
// - PERF_BUDGET_ASSETS_BYTES: static assets (biggest startup risk)
const BUDGET_CORE = Number(process.env.PERF_BUDGET_CORE_BYTES ?? '') || 2_000_000
const BUDGET_ASSETS = Number(process.env.PERF_BUDGET_ASSETS_BYTES ?? '') || 18_000_000

const TARGETS = [
  { name: 'dist-core', budget: BUDGET_CORE },
  { name: 'assets', budget: BUDGET_ASSETS },
]

function folderSize(dir) {
  let total = 0
  if (!fs.existsSync(dir)) return 0
  const stack = [dir]
  while (stack.length) {
    const cur = stack.pop()
    const st = fs.statSync(cur)
    if (st.isDirectory()) {
      for (const ent of fs.readdirSync(cur)) stack.push(path.join(cur, ent))
    } else {
      total += st.size
    }
  }
  return total
}

const results = TARGETS.map((t) => {
  const size = folderSize(path.join(ROOT, t.name))
  return { ...t, size }
})

const fmt = (n) => `${(n / 1024).toFixed(1)} KB`

const core = results.find((r) => r.name === 'dist-core')
if (!core?.size) {
  console.log('perf:budget skipped (no dist-core yet). Run npm run build:core first.')
  process.exit(0)
}

let failed = false
for (const r of results) {
  if (!r.size) continue
  if (r.size > r.budget) {
    console.error(`perf:budget FAILED: ${r.name} ${fmt(r.size)} > ${fmt(r.budget)}`)
    failed = true
  } else {
    console.log(`perf:budget OK: ${r.name} ${fmt(r.size)} <= ${fmt(r.budget)}`)
  }
}

if (failed) process.exit(1)
