#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const strict = process.argv.includes('--strict')

const uiComponentsDir = path.join(root, 'src', 'ui', 'components')
const uiPrimitivesDir = path.join(root, 'src', 'ui', 'primitives')
const appScreensDir = path.join(root, 'src', 'app', 'screens')
const storiesDir = path.join(root, 'src')

const outputDir = path.join(root, 'docs', 'design-system')
const reportJsonPath = path.join(outputDir, 'storybook_coverage_report.json')
const reportMdPath = path.join(outputDir, 'storybook_expansion_map.md')

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  const stack = [dir]
  while (stack.length) {
    const cur = stack.pop()
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      if (entry.name === 'node_modules') continue
      const full = path.join(cur, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
      } else {
        out.push(full)
      }
    }
  }
  return out
}

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/')
}

function baseName(filePath) {
  const name = path.basename(filePath)
  return name.replace(/\.[^.]+$/, '')
}

function canonicalStoryName(filePath) {
  const b = baseName(filePath)
  const withoutStories = b.replace(/\.stories$/, '')
  return withoutStories
    .replace(/\.(screen|primitive|atom|molecule|organism)$/i, '')
    .toLowerCase()
}

function screenName(filePath) {
  return baseName(filePath).replace(/Screen$/, '')
}

function hasTsx(filePath) {
  return filePath.endsWith('.tsx')
}

function isStory(filePath) {
  return filePath.endsWith('.stories.tsx')
}

function isIndexFile(filePath) {
  const b = baseName(filePath).toLowerCase()
  return b === 'index'
}

function parseStoryStates(filePath) {
  const src = fs.readFileSync(filePath, 'utf8')
  const exported = Array.from(src.matchAll(/export const\s+([A-Za-z0-9_]+)/g)).map((m) => m[1].toLowerCase())
  const states = {
    default: exported.some((x) => x === 'default' || x === 'primary' || x === 'base'),
    loading: exported.some((x) => x.includes('loading')),
    disabled: exported.some((x) => x.includes('disabled')),
    error: exported.some((x) => x.includes('error')),
    empty: exported.some((x) => x.includes('empty')),
    success: exported.some((x) => x.includes('success')),
  }
  return { exported, states }
}

const componentFiles = walk(uiComponentsDir).filter(hasTsx).filter((f) => !isStory(f)).filter((f) => !isIndexFile(f))
const primitiveFiles = walk(uiPrimitivesDir).filter(hasTsx).filter((f) => !isStory(f)).filter((f) => !isIndexFile(f))
const screenFiles = walk(appScreensDir)
  .filter(hasTsx)
  .filter((f) => baseName(f).endsWith('Screen'))
  .filter((f) => !baseName(f).startsWith('ScreenPreview'))

const storyFiles = walk(storiesDir).filter(isStory)
const storyNames = new Set(storyFiles.map(canonicalStoryName))

const storyStateByFile = Object.fromEntries(
  storyFiles.map((f) => [rel(f), parseStoryStates(f)]),
)

function coveredByStory(name) {
  return storyNames.has(name.toLowerCase())
}

const components = componentFiles.map((f) => {
  const name = baseName(f)
  return {
    name,
    path: rel(f),
    hasStory: coveredByStory(name),
  }
})

const primitives = primitiveFiles.map((f) => {
  const name = baseName(f)
  return {
    name,
    path: rel(f),
    hasStory: coveredByStory(name),
  }
})

const screens = screenFiles.map((f) => {
  const name = screenName(f)
  return {
    name,
    path: rel(f),
    hasStory: coveredByStory(name),
  }
})

const missingComponents = components.filter((c) => !c.hasStory)
const missingPrimitives = primitives.filter((c) => !c.hasStory)
const missingScreens = screens.filter((s) => !s.hasStory)

const stateCoverage = Object.entries(storyStateByFile).map(([filePath, data]) => {
  const requiredMissing = Object.entries(data.states)
    .filter(([, present]) => !present)
    .map(([state]) => state)
  return {
    file: filePath,
    ...data.states,
    missing: requiredMissing,
  }
})

const storyFilesMissingRequiredStates = stateCoverage.filter((x) => x.missing.length > 0)

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    components: components.length,
    primitives: primitives.length,
    screens: screens.length,
    stories: storyFiles.length,
  },
  coverage: {
    componentsCovered: components.length - missingComponents.length,
    primitivesCovered: primitives.length - missingPrimitives.length,
    screensCovered: screens.length - missingScreens.length,
  },
  missing: {
    components: missingComponents,
    primitives: missingPrimitives,
    screens: missingScreens,
    storyFilesMissingRequiredStates,
  },
}

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(reportJsonPath, JSON.stringify(summary, null, 2))

const lines = []
lines.push('# Storybook Expansion Map')
lines.push('')
lines.push(`Generated: ${summary.generatedAt}`)
lines.push('')
lines.push('## Coverage Summary')
lines.push('')
lines.push(`- Components: ${summary.coverage.componentsCovered}/${summary.totals.components}`)
lines.push(`- Primitives: ${summary.coverage.primitivesCovered}/${summary.totals.primitives}`)
lines.push(`- Screens: ${summary.coverage.screensCovered}/${summary.totals.screens}`)
lines.push(`- Story files: ${summary.totals.stories}`)
lines.push('')
lines.push('## Missing Component Stories')
lines.push('')
if (missingComponents.length === 0) {
  lines.push('- None')
} else {
  for (const item of missingComponents) lines.push(`- ${item.name}: ${item.path}`)
}
lines.push('')
lines.push('## Missing Primitive Stories')
lines.push('')
if (missingPrimitives.length === 0) {
  lines.push('- None')
} else {
  for (const item of missingPrimitives) lines.push(`- ${item.name}: ${item.path}`)
}
lines.push('')
lines.push('## Missing Screen Stories')
lines.push('')
if (missingScreens.length === 0) {
  lines.push('- None')
} else {
  for (const item of missingScreens) lines.push(`- ${item.name}: ${item.path}`)
}
lines.push('')
lines.push('## State Coverage Matrix (Per Story File)')
lines.push('')
lines.push('| Story file | Default | Loading | Disabled | Error | Empty | Success | Missing |')
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |')
for (const s of stateCoverage) {
  lines.push(
    `| ${s.file} | ${s.default ? 'Y' : 'N'} | ${s.loading ? 'Y' : 'N'} | ${s.disabled ? 'Y' : 'N'} | ${s.error ? 'Y' : 'N'} | ${s.empty ? 'Y' : 'N'} | ${s.success ? 'Y' : 'N'} | ${s.missing.join(', ') || '-'} |`,
  )
}

fs.writeFileSync(reportMdPath, `${lines.join('\n')}\n`)

const hasCoverageGaps =
  missingComponents.length > 0 ||
  missingPrimitives.length > 0 ||
  missingScreens.length > 0 ||
  storyFilesMissingRequiredStates.length > 0

if (strict && hasCoverageGaps) {
  console.error('Design-system audit failed. See docs/design-system/storybook_coverage_report.json')
  process.exit(1)
}

console.log('Design-system audit complete.')
console.log(`Report: ${rel(reportJsonPath)}`)
console.log(`Map: ${rel(reportMdPath)}`)
