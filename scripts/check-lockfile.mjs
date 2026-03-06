import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const lock = path.join(root, 'package-lock.json')
const strict = process.env.RELEASE === '1' || process.env.STRICT_LOCKFILE === '1' || process.env.CI === '1'

if (!fs.existsSync(lock)) {
  const msg = 'package-lock.json missing. Run: npm install (and commit the lockfile) for deterministic installs.'
  if (strict) {
    console.error('⛔ ' + msg)
    process.exit(1)
  } else {
    console.log('🟡 ' + msg + ' (not enforced; set STRICT_LOCKFILE=1 to enforce)')
    process.exit(0)
  }
}

const stat = fs.statSync(lock)
let isStub = false
try {
  const json = JSON.parse(fs.readFileSync(lock, 'utf8'))
  const pkgs = json?.packages && typeof json.packages === 'object' ? Object.keys(json.packages) : []
  // A "stub" lockfile often contains only the root package.
  if (pkgs.length <= 1) isStub = true
} catch {
  // If it can't be parsed, treat as invalid when strict.
  isStub = true
}

if (strict && (stat.size < 2000 || isStub)) {
  console.error('⛔ package-lock.json is missing dependencies / looks like a stub. Regenerate locally: rm package-lock.json && npm i && git add package-lock.json')
  process.exit(1)
}

if (!strict && (stat.size < 2000 || isStub)) {
  console.log('🟡 package-lock.json appears to be a stub. Regenerate locally for deterministic installs: rm package-lock.json && npm i')
  process.exit(0)
}

console.log('✅ lockfile present' + (strict ? '' : ' (not enforced)'))
