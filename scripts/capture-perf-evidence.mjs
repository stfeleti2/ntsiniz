#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

// Non-interactive helper to append a perf evidence entry.
// Usage:
//   node scripts/capture-perf-evidence.mjs --device "Galaxy A13" --tier LOW --os Android --build devclient --fps 60 --dropped 0 --notes "no glitches"

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return null
  return process.argv[i + 1] ?? null
}

const entry = {
  date: new Date().toISOString().slice(0, 10),
  device: arg('device') ?? 'UNKNOWN',
  tier: arg('tier') ?? 'UNKNOWN',
  os: arg('os') ?? 'UNKNOWN',
  build: arg('build') ?? 'UNKNOWN',
  test: 'killer_loop',
  overlayFps: Number(arg('fps') ?? '0') || 0,
  frameBusDropped: Number(arg('dropped') ?? '0') || 0,
  audioGlitches: arg('glitches') ?? 'unknown',
  route: arg('route') ?? 'unknown',
  sampleRate: arg('sampleRate') ?? 'unknown',
  notes: arg('notes') ?? '',
}

const file = path.join(process.cwd(), 'docs', 'PERF_EVIDENCE.md')

if (!fs.existsSync(file)) {
  console.error('[capture-perf-evidence] docs/PERF_EVIDENCE.md not found')
  process.exit(1)
}

const block = [
  '',
  `## ${entry.date} — ${entry.device} (${entry.os}, ${entry.tier})`,
  `- Build: ${entry.build}`,
  `- Test: ${entry.test}`,
  `- Overlay FPS: ${entry.overlayFps}`,
  `- FrameBus dropped: ${entry.frameBusDropped}`,
  `- Audio glitches: ${entry.audioGlitches}`,
  `- Route: ${entry.route}`,
  `- Sample rate: ${entry.sampleRate}`,
  entry.notes ? `- Notes: ${entry.notes}` : `- Notes: (none)`,
  '',
].join('\n')

fs.appendFileSync(file, block, 'utf8')
console.log('[capture-perf-evidence] appended entry to docs/PERF_EVIDENCE.md')
