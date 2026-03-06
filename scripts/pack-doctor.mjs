#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'src', 'content')

function listJsonFiles(dir) {
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...listJsonFiles(p))
    else if (ent.isFile() && ent.name.endsWith('.json')) out.push(p)
  }
  return out
}

function fail(msg) {
  console.error(`\n[pack-doctor] ERROR: ${msg}`)
  process.exitCode = 1
}

function warn(msg) {
  console.warn(`[pack-doctor] WARN: ${msg}`)
}

function checkCurriculum(obj, file) {
  if (!obj || typeof obj !== 'object') return fail(`${file}: not an object`)
  if (!Array.isArray(obj.days)) return fail(`${file}: missing days[]`)
  for (const d of obj.days) {
    if (!d?.id || !d?.title) fail(`${file}: day missing id/title`) 
    if (!Array.isArray(d.drills)) warn(`${file}: day ${d.id} missing drills[] (ok if using lessons)`)
    if (Array.isArray(d.drills) && d.drills.length > 3) warn(`${file}: day ${d.id} has ${d.drills.length} drills (recommend <=3 for daily plan)`)
  }
}

function checkDrills(obj, file) {
  if (!obj || typeof obj !== 'object') return fail(`${file}: not an object`)
  if (!Array.isArray(obj.drills)) return fail(`${file}: missing drills[]`)
  for (const d of obj.drills) {
    if (!d?.id || !d?.title || !d?.type) fail(`${file}: drill missing id/title/type`)
  }
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('[pack-doctor] no src/content found, skipping')
    return
  }

  const files = listJsonFiles(CONTENT_DIR)
  if (!files.length) {
    console.log('[pack-doctor] no JSON content files found')
    return
  }

  for (const f of files) {
    let raw = ''
    try {
      raw = fs.readFileSync(f, 'utf8')
    } catch (e) {
      fail(`${f}: cannot read (${e?.message ?? e})`)
      continue
    }

    let obj
    try {
      obj = JSON.parse(raw)
    } catch (e) {
      fail(`${path.relative(ROOT, f)}: invalid JSON (${e?.message ?? e})`)
      continue
    }

    const rel = path.relative(ROOT, f)
    if (rel.includes('/curriculum/')) checkCurriculum(obj, rel)
    if (rel.includes('/drills/')) checkDrills(obj, rel)
  }

  if (process.exitCode) {
    console.error('\n[pack-doctor] FAILED')
    process.exit(process.exitCode)
  }

  console.log(`[pack-doctor] OK (${files.length} files checked)`) 
}

main()
