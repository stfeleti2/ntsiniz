import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'

const repoRoot = process.cwd()
const arg = process.argv[2]

if (!arg) {
  console.error('Usage: node scripts/import-guided-journey-v6.mjs <zip-or-pack-path>')
  process.exit(1)
}

const sourcePath = path.resolve(arg)
if (!fs.existsSync(sourcePath)) {
  console.error(`V6 source not found: ${sourcePath}`)
  process.exit(1)
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ntsiniz-v6-import-'))
const extractedRoot = path.join(tempRoot, 'extracted')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyFile(from, to) {
  ensureDir(path.dirname(to))
  fs.copyFileSync(from, to)
}

function resolvePackRoot(inputPath) {
  const stat = fs.statSync(inputPath)
  if (stat.isDirectory()) {
    if (path.basename(inputPath) === 'ntsiniz_v6_pack') return inputPath
    const nested = path.join(inputPath, 'ntsiniz_v6_pack')
    if (fs.existsSync(nested)) return nested
    return inputPath
  }

  if (!inputPath.endsWith('.zip')) {
    throw new Error(`Unsupported V6 source: ${inputPath}`)
  }

  ensureDir(extractedRoot)
  execFileSync('unzip', ['-q', inputPath, '-d', extractedRoot], { stdio: 'inherit' })
  const nested = path.join(extractedRoot, 'ntsiniz_v6_pack')
  if (fs.existsSync(nested)) return nested
  return extractedRoot
}

const packRoot = resolvePackRoot(sourcePath)

const requiredFiles = [
  'curriculum_full_production.json',
  'README_AGENT_INTEGRATION_v6.md',
  'scoring_engine_spec.json',
  'adaptive_engine.ts',
  'scoring_engine.ts',
  'pitch_math.ts',
]

for (const file of requiredFiles) {
  const candidate = path.join(packRoot, file)
  if (!fs.existsSync(candidate)) {
    throw new Error(`Missing V6 pack file: ${candidate}`)
  }
}

const contentTarget = path.join(repoRoot, 'src/content/guided_journey/production.en.json')
copyFile(path.join(packRoot, 'curriculum_full_production.json'), contentTarget)

const refDir = path.join(repoRoot, 'src/core/guidedJourney/reference/v6')
ensureDir(refDir)
for (const file of requiredFiles.filter((item) => item !== 'curriculum_full_production.json')) {
  copyFile(path.join(packRoot, file), path.join(refDir, file))
}

console.log(`Imported V6 curriculum into ${contentTarget}`)
console.log(`Vendored V6 reference files into ${refDir}`)
