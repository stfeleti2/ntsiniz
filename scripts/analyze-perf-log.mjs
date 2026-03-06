import fs from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/analyze-perf-log.mjs <perf-log.json>')
  process.exit(2)
}

const log = JSON.parse(fs.readFileSync(file, 'utf8'))

// Expected schema:
// { device: { tier, model }, mode: 'HIGH'|'BALANCED'|'LITE', samples: [{t, p95StallMs, worstStallMs, frameBusDropped}] }

function verdict(name, ok, detail) {
  return { name, ok, detail }
}

const mode = log.mode
const tier = log.device?.tier

const budgets = {
  HIGH: { p95: 160, worst: 800, drops: 0 },
  BALANCED: { p95: 220, worst: 900, drops: 0 },
  LITE: { p95: 450, worst: 1100, drops: 3 },
}

const b = budgets[mode]
if (!b) {
  console.error(`Unknown mode ${mode}`)
  process.exit(2)
}

const p95max = Math.max(...log.samples.map(s => s.p95StallMs ?? 0))
const worstmax = Math.max(...log.samples.map(s => s.worstStallMs ?? 0))
const drops = Math.max(...log.samples.map(s => s.frameBusDropped ?? 0))

const checks = [
  verdict('p95 stalls', p95max <= b.p95, `max p95=${p95max}ms (budget ${b.p95}ms)`),
  verdict('worst stalls', worstmax <= b.worst, `max worst=${worstmax}ms (budget ${b.worst}ms)`),
  verdict('FrameBus drops', drops <= b.drops, `max drops=${drops} (budget ${b.drops})`),
]

const ok = checks.every(c => c.ok)

console.log(JSON.stringify({
  device: log.device,
  mode,
  tier,
  windowSec: log.windowSec,
  summary: { p95max, worstmax, drops },
  checks,
  result: ok ? 'PASS' : 'FAIL',
}, null, 2))

process.exit(ok ? 0 : 1)
