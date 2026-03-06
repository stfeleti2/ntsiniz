#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const RELEASE = process.env.RELEASE === '1'
const file = path.join(process.cwd(), 'docs/privacy/STORE_FORMS_SNAPSHOT.md')

if (!RELEASE) {
  console.log('check:store-forms skipped (set RELEASE=1 to enforce)')
  process.exit(0)
}

if (!fs.existsSync(file)) {
  console.error('Missing docs/privacy/STORE_FORMS_SNAPSHOT.md')
  process.exit(1)
}

const txt = fs.readFileSync(file, 'utf8')
const bad = /(\bTBD\b|\bTODO\b|\bPLACEHOLDER\b)/i.test(txt)
if (bad) {
  console.error('STORE_FORMS_SNAPSHOT.md still contains TBD/TODO placeholders. Paste store form values for release.')
  process.exit(1)
}

console.log('check:store-forms OK')
