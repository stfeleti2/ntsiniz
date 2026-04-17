import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const strict = process.argv.includes('--strict')

const screensDir = path.join(root, 'src/app/screens')
const storiesDir = path.join(root, 'src/storybook/stories/screens')
const navFile = path.join(root, 'src/app/navigation/surfaceScreens.ts')
const reportJsonPath = path.join(root, 'docs/design-system/screen_audit_report.json')
const reportMdPath = path.join(root, 'docs/design-system/screen_audit_report.md')

function rel(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/')
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

function listFiles(dirPath, predicate) {
  if (!fs.existsSync(dirPath)) return []
  return fs
    .readdirSync(dirPath)
    .filter((name) => predicate(name))
    .map((name) => path.join(dirPath, name))
}

function extractRegisteredRouteNames() {
  const content = safeRead(navFile)
  const names = new Set()
  const matches = content.matchAll(/name:\s*'([^']+)'/g)
  for (const match of matches) {
    const routeName = match[1]
    if (routeName === 'MainTabs') continue
    names.add(routeName)
  }
  return Array.from(names).sort()
}

function inferStateCoverage(fileContent) {
  const hasLoading = /\bloading\b|\bbusy\b|isLoading|Skeleton|Loading/i.test(fileContent)
  const hasEmpty = /EmptyState|ListEmptyComponent|\bempty\b|no[_A-Za-z]/i.test(fileContent)
  const hasError = /ErrorState|\berror\b|catch\s*\(|Alert\.alert\([^)]*error/i.test(fileContent)
  const hasSuccess = /\bsuccess\b|\bcomplete\b|\bcompleted\b|\bapplied\b|\bok\b/i.test(fileContent)
  return {
    loading: hasLoading,
    empty: hasEmpty,
    error: hasError,
    success: hasSuccess,
  }
}

function detectUiCompliance(fileContent) {
  const hardcodedColorMatches =
    fileContent.match(/#[0-9A-Fa-f]{3,8}|rgba\(|rgb\(/g)?.length ?? 0

  return {
    usesScreenWrapper: /from\s+['\"]@\/ui\/components\/Screen['\"]/.test(fileContent),
    usesSafeAreaDirectly: /SafeAreaView/.test(fileContent),
    usesDesignSystemImports:
      /from\s+['\"]@\/ui\/components\/kit/.test(fileContent) ||
      /from\s+['\"]@\/ui\/primitives/.test(fileContent),
    hardcodedColorMatches,
  }
}

function stateGapList(coverage) {
  const gaps = []
  if (!coverage.loading) gaps.push('loading')
  if (!coverage.empty) gaps.push('empty')
  if (!coverage.error) gaps.push('error')
  if (!coverage.success) gaps.push('success')
  return gaps
}

function buildAudit() {
  const registeredRoutes = extractRegisteredRouteNames()
  const screenFiles = listFiles(screensDir, (name) => /Screen\.tsx$/.test(name))
  const storyFiles = listFiles(storiesDir, (name) => /\.screen\.stories\.tsx$/.test(name))

  const screenByName = new Map()
  for (const filePath of screenFiles) {
    const fileName = path.basename(filePath)
    const screenName = fileName.replace(/Screen\.tsx$/, '')
    const content = safeRead(filePath)
    const ui = detectUiCompliance(content)
    const stateCoverage = inferStateCoverage(content)
    const stateGaps = stateGapList(stateCoverage)
    const issues = []

    if (!ui.usesScreenWrapper) issues.push('missing-screen-wrapper')
    if (ui.usesSafeAreaDirectly) issues.push('direct-safe-area-usage')
    if (!ui.usesDesignSystemImports) issues.push('missing-design-system-imports')
    if (ui.hardcodedColorMatches > 0) issues.push('hardcoded-color-tokens')
    if (stateGaps.length > 0) issues.push(`missing-states:${stateGaps.join(',')}`)

    screenByName.set(screenName, {
      name: screenName,
      file: rel(filePath),
      routeRegistered: registeredRoutes.includes(screenName),
      storyFile: `src/storybook/stories/screens/${screenName}.screen.stories.tsx`,
      uiCompliance: ui,
      stateCoverage,
      missingStates: stateGaps,
      issues,
    })
  }

  const storyByName = new Map()
  for (const filePath of storyFiles) {
    const fileName = path.basename(filePath)
    const screenName = fileName.replace(/\.screen\.stories\.tsx$/, '')
    const content = safeRead(filePath)
    const requiredStoryStates = {
      default: /export\s+const\s+Default\s*:/.test(content),
      loading: /export\s+const\s+Loading\s*:/.test(content),
      disabled: /export\s+const\s+Disabled\s*:/.test(content),
      error: /export\s+const\s+Error\s*:/.test(content),
      empty: /export\s+const\s+Empty\s*:/.test(content),
      success: /export\s+const\s+Success\s*:/.test(content),
    }
    storyByName.set(screenName, {
      name: screenName,
      file: rel(filePath),
      requiredStoryStates,
      missingStoryStates: Object.entries(requiredStoryStates)
        .filter(([, present]) => !present)
        .map(([key]) => key),
    })
  }

  const registeredWithoutScreen = registeredRoutes.filter((name) => !screenByName.has(name))
  const screensWithoutRoute = Array.from(screenByName.values())
    .filter((s) => !s.routeRegistered)
    .map((s) => s.name)
  const registeredWithoutStory = registeredRoutes.filter((name) => !storyByName.has(name))
  const storiesWithoutRoute = Array.from(storyByName.values())
    .filter((s) => !registeredRoutes.includes(s.name))
    .map((s) => s.name)

  const fullScreenRecords = Array.from(screenByName.values()).map((screen) => {
    const story = storyByName.get(screen.name)
    return {
      ...screen,
      hasStory: !!story,
      storyMissingStates: story?.missingStoryStates ?? ['default', 'loading', 'disabled', 'error', 'empty', 'success'],
    }
  })

  const severity = {
    critical: fullScreenRecords.filter((s) => !s.routeRegistered || !s.hasStory || s.storyMissingStates.length > 0).length,
    high: fullScreenRecords.filter((s) => s.missingStates.length > 0).length,
    medium: fullScreenRecords.filter((s) => s.uiCompliance.hardcodedColorMatches > 0).length,
    low: fullScreenRecords.filter((s) => s.uiCompliance.usesSafeAreaDirectly).length,
  }

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      screenFiles: screenFiles.length,
      registeredRoutes: registeredRoutes.length,
      storyFiles: storyFiles.length,
    },
    severity,
    gaps: {
      registeredWithoutScreen,
      screensWithoutRoute,
      registeredWithoutStory,
      storiesWithoutRoute,
    },
    screens: fullScreenRecords.sort((a, b) => a.name.localeCompare(b.name)),
  }
}

function toMarkdown(report) {
  const lines = []
  lines.push('# Screen System Audit Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')
  lines.push('## Totals')
  lines.push('')
  lines.push(`- Screen files: ${report.totals.screenFiles}`)
  lines.push(`- Registered routes: ${report.totals.registeredRoutes}`)
  lines.push(`- Screen story files: ${report.totals.storyFiles}`)
  lines.push('')
  lines.push('## Severity')
  lines.push('')
  lines.push(`- Critical: ${report.severity.critical}`)
  lines.push(`- High: ${report.severity.high}`)
  lines.push(`- Medium: ${report.severity.medium}`)
  lines.push(`- Low: ${report.severity.low}`)
  lines.push('')

  lines.push('## Route / Story Gaps')
  lines.push('')
  lines.push(`- Registered routes missing screens: ${report.gaps.registeredWithoutScreen.join(', ') || 'None'}`)
  lines.push(`- Screen files without registered route: ${report.gaps.screensWithoutRoute.join(', ') || 'None'}`)
  lines.push(`- Registered routes missing stories: ${report.gaps.registeredWithoutStory.join(', ') || 'None'}`)
  lines.push(`- Story files without route: ${report.gaps.storiesWithoutRoute.join(', ') || 'None'}`)
  lines.push('')

  lines.push('## Screen Findings')
  lines.push('')
  lines.push('| Screen | Route | Story | Missing App States | Missing Story States | Compliance Issues |')
  lines.push('| --- | --- | --- | --- | --- | --- |')
  for (const s of report.screens) {
    lines.push(
      `| ${s.name} | ${s.routeRegistered ? 'Y' : 'N'} | ${s.hasStory ? 'Y' : 'N'} | ${s.missingStates.join(', ') || '-'} | ${s.storyMissingStates.join(', ') || '-'} | ${s.issues.join(', ') || '-'} |`,
    )
  }

  return lines.join('\n')
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true })
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2))
  fs.writeFileSync(reportMdPath, toMarkdown(report))
}

const report = buildAudit()
writeReport(report)

console.log('Screen-system audit complete.')
console.log(`Report: ${rel(reportJsonPath)}`)
console.log(`Summary: ${rel(reportMdPath)}`)

const criticalFailure =
  report.gaps.registeredWithoutScreen.length > 0 ||
  report.gaps.registeredWithoutStory.length > 0 ||
  report.screens.some((s) => s.storyMissingStates.length > 0)

if (strict && criticalFailure) {
  console.error('Screen-system audit failed in strict mode.')
  process.exit(1)
}
