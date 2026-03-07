#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const distRoot = path.resolve('dist-tests')
const registerFile = path.resolve('dist-tests/ui/testing/register.js')

function collectUiTestFiles(rootDir) {
  const stack = [rootDir]
  const results = []

  while (stack.length) {
    const dir = stack.pop()
    if (!dir) continue

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }

      if (!entry.isFile()) continue

      const normalized = fullPath.split(path.sep).join('/')
      if (normalized.includes('/tests/') && normalized.endsWith('.test.js')) {
        results.push(fullPath)
      }
    }
  }

  return results.sort()
}

if (!fs.existsSync(distRoot)) {
  console.error(`Missing compiled test output directory: ${distRoot}`)
  process.exit(1)
}

if (!fs.existsSync(registerFile)) {
  console.error(`Missing UI test register file: ${registerFile}`)
  process.exit(1)
}

const testFiles = collectUiTestFiles(distRoot)

if (testFiles.length === 0) {
  console.error(`No UI test files found under ${distRoot}`)
  process.exit(1)
}

const run = spawnSync(
  process.execPath,
  ['-r', registerFile, '--test', ...testFiles],
  { stdio: 'inherit' }
)

if (run.error) {
  console.error(run.error.message)
  process.exit(1)
}

process.exit(run.status ?? 1)
