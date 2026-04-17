import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const storiesRoot = path.resolve(process.cwd(), 'src/storybook/stories')

function walkFiles(root: string) {
  const out: string[] = []
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    if (!dir) continue
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) stack.push(full)
      if (entry.isFile()) out.push(full)
    }
  }
  return out
}

test('storybook stories follow naming taxonomy', () => {
  const files = walkFiles(storiesRoot).map((f) => f.split(path.sep).join('/'))
  assert.equal(files.length > 0, true)
  for (const file of files) {
    assert.equal(/\.(atom|molecule|organism|screen)\.stories\.tsx$/.test(file), true, `invalid story name: ${file}`)
  }
})

test('required full-screen stories exist', () => {
  const required = [
    'Welcome.screen.stories.tsx',
    'SingingLevelSelection.screen.stories.tsx',
    'MicPermission.screen.stories.tsx',
    'RangeFinder.screen.stories.tsx',
    'Drill.screen.stories.tsx',
    'Playback.screen.stories.tsx',
    'SessionSummary.screen.stories.tsx',
  ]

  const files = new Set(
    walkFiles(path.join(storiesRoot, 'screens')).map((f) => path.basename(f)),
  )

  for (const expected of required) {
    assert.equal(files.has(expected), true, `missing required screen story: ${expected}`)
  }
})

