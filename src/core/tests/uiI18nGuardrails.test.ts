import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { en } from '../i18n/en.js'

const ROOT = process.cwd()
const SOURCE_DIRS = ['src/app', 'src/ui', 'src/core']
const IGNORE_DIR_NAMES = new Set(['node_modules', 'dist-core', 'dist-tests', 'android', 'ios', '.git', '.expo'])

function walkFiles(dirAbs: string, files: string[] = []): string[] {
  if (!fs.existsSync(dirAbs)) return files
  for (const ent of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    const abs = path.join(dirAbs, ent.name)
    if (ent.isDirectory()) {
      if (IGNORE_DIR_NAMES.has(ent.name)) continue
      walkFiles(abs, files)
      continue
    }
    files.push(abs)
  }
  return files
}

function sourceFiles(ext: '.ts' | '.tsx'): string[] {
  return SOURCE_DIRS
    .flatMap((d) => walkFiles(path.join(ROOT, d)))
    .filter((f) => f.endsWith(ext))
}

function hasI18nPath(key: string): boolean {
  let cur: any = en
  for (const p of key.split('.')) {
    if (!cur || typeof cur !== 'object' || !(p in cur)) return false
    cur = cur[p]
  }
  return cur != null
}

function lineOf(text: string, offset: number): number {
  return text.slice(0, offset).split('\n').length
}

test('all static i18n t() keys resolve in en.ts', () => {
  const keyRe = /\bt\(\s*(['"])([^'"]+)\1/g
  const missing: string[] = []

  for (const file of [...sourceFiles('.ts'), ...sourceFiles('.tsx')]) {
    if (file.includes('/src/core/tests/') || file.includes('/src/ui/testing/')) continue
    const text = fs.readFileSync(file, 'utf8')
    let m: RegExpExecArray | null
    while ((m = keyRe.exec(text))) {
      const key = m[2]
      if (!key || key.endsWith('.')) continue
      const rest = text.slice(keyRe.lastIndex)
      const next = (rest.match(/^\s*(.)/) || [])[1] ?? ''
      // Skip dynamic-prefix forms like t('grading.label.' + value).
      if (next === '+') continue
      if (!hasI18nPath(key)) {
        missing.push(`${path.relative(ROOT, file)}:${lineOf(text, m.index)} -> ${key}`)
      }
    }
  }

  assert.equal(
    missing.length,
    0,
    `Missing i18n keys in en.ts:\n${missing.slice(0, 50).join('\n')}${missing.length > 50 ? `\n... +${missing.length - 50} more` : ''}`,
  )
})

test('no map callback item is used directly as React key', () => {
  const bad: string[] = []
  const re = /\.map\(\s*\((\w+)(?:\s*,\s*(\w+))?\)\s*=>[\s\S]{0,500}?key=\{\1\}/g

  for (const file of sourceFiles('.tsx')) {
    if (file.includes('/src/ui/testing/')) continue
    const text = fs.readFileSync(file, 'utf8')
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      bad.push(`${path.relative(ROOT, file)}:${lineOf(text, m.index)} -> key={${m[1]}}`)
    }
  }

  assert.equal(
    bad.length,
    0,
    `Potential duplicate-key risk: map callback value used directly as key.\n${bad.slice(0, 50).join('\n')}${bad.length > 50 ? `\n... +${bad.length - 50} more` : ''}`,
  )
})
