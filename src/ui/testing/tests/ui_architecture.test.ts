import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function collectFiles(dirPath: string, extensions: string[]) {
  const results: string[] = []
  const stack = [dirPath]
  while (stack.length) {
    const dir = stack.pop()
    if (!dir || !fs.existsSync(dir)) continue
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }
      if (entry.isFile() && extensions.some((ext) => fullPath.endsWith(ext))) {
        results.push(fullPath)
      }
    }
  }
  return results
}

test('new ui system paths avoid direct legacy ui imports', () => {
  const files = [
    ...collectFiles(path.join(root, 'src/components'), ['.ts', '.tsx']),
    ...collectFiles(path.join(root, 'src/screens/previews'), ['.ts', '.tsx']),
    ...collectFiles(path.join(root, 'src/storybook'), ['.ts', '.tsx']),
  ]

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    assert.equal(source.includes('@/ui/'), false, `legacy import found in ${file}`)
  }
})

test('storybook config remains dev-only behind env flags', () => {
  const appFile = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8')
  const metroFile = fs.readFileSync(path.join(root, 'metro.config.js'), 'utf8')

  assert.equal(appFile.includes('EXPO_PUBLIC_STORYBOOK_ENABLED'), true)
  assert.equal(appFile.includes('EXPO_PUBLIC_STORYBOOK_ROOT'), true)
  assert.equal(metroFile.includes('EXPO_PUBLIC_STORYBOOK_ENABLED'), true)
})

