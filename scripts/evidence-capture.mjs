import { spawnSync } from 'node:child_process'

// One-command wrapper for release evidence capture.

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('node', ['scripts/capture-perf-evidence.mjs'])

console.log('✅ evidence capture done (perf).')
console.log('Next: attach real-device notes in docs/DEVICE_MATRIX.md.')
