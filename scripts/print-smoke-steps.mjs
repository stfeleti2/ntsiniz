import fs from 'node:fs'

const path = new URL('../docs/SMOKE_TEST.md', import.meta.url)
const txt = fs.readFileSync(path, 'utf8')
console.log(txt.trim())
