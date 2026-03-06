import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src/core/perf/qualityHeuristics.ts')
const OUT_MD = path.join(ROOT, 'docs/qa/PERF_GOLD_PROOF.md')

function extractObject(name, text) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*({[\\s\\S]*?^})`, 'm')
  const m = text.match(re)
  if (!m) return null
  const objText = m[1]
    .replace(/([,{])\s*(\w+)\s*:/g, '$1 "$2":')
    .replace(/,\s*}/g, ' }')
    .replace(/,\s*]/g, ' ]')
  try {
    return JSON.parse(objText)
  } catch {
    return null
  }
}

const ts = fs.readFileSync(SRC, 'utf8')
const gold = extractObject('GOLD', ts)
const floor = extractObject('FLOOR', ts)

const now = new Date().toISOString()

const md = `# Perf “Gold Target” Proof (Static)\n\nThis document is **auto-generated** from the source-of-truth thresholds in:\n\n- \`${path.relative(ROOT, SRC)}\`\n\nGenerated at: **${now}**\n\n## What this proves\n\n✅ The **gold/floor budgets** used by the adaptive Quality Mode system are *actually present in code*.\n\n🟡 Real-device smoothness still requires running the **profiling steps** in \`docs/qa/PERF_QUALITY_MODES.md\` and collecting logs.\n\n## Gold targets (premium feel)\n\n\`\n${JSON.stringify(gold, null, 2)}\n\`\n\n## Floor targets (still supported)\n\n\`\n${JSON.stringify(floor, null, 2)}\n\`\n\n## Next: runtime proof\n\n1. Enable Dev Perf Overlay in-app.\n2. Run a 2-minute drill per tier device.\n3. Export perf snapshots (instructions in \`docs/qa/PERF_QUALITY_MODES.md\`).\n4. Attach the JSON logs to the release PR.\n`

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true })
fs.writeFileSync(OUT_MD, md)
console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`)
