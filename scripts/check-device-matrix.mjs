#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const RELEASE = process.env.RELEASE === '1'
const file = path.join(process.cwd(), 'docs/qa/DEVICE_MATRIX.md')

if (!RELEASE) {
  console.log('check:device-matrix skipped (set RELEASE=1 to enforce)')
  process.exit(0)
}

if (!fs.existsSync(file)) {
  console.error('Missing docs/qa/DEVICE_MATRIX.md')
  process.exit(1)
}

const txt = fs.readFileSync(file, 'utf8')
const bad = /(\bTBD\b|\bTODO\b|\bPLACEHOLDER\b)/i.test(txt)
if (bad) {
  console.error('DEVICE_MATRIX.md still contains TBD/TODO placeholders. Fill it for release.')
  process.exit(1)
}

console.log('check:device-matrix OK')
