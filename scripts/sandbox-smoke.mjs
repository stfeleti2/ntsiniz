#!/usr/bin/env node
import assert from "node:assert/strict"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { createRequire } from "node:module"

const cwd = process.cwd()
const require = createRequire(import.meta.url)

require(path.resolve(cwd, "dist-tests/ui/testing/register.js"))

async function loadDistModule(relPath) {
  const abs = path.resolve(cwd, relPath)
  return import(pathToFileURL(abs).href)
}

const { getEnabledStackScreenNames } = await loadDistModule("dist-tests/app/navigation/surfacePolicy.js")
const { flowScenarios } = await loadDistModule("dist-tests/app/dev/sandbox/scenarios.js")
const { buildTheme } = await loadDistModule("dist-tests/ui/theme/theme.js")
const { orderedScreenPreviews } = await loadDistModule("dist-tests/screens/previews/registry.js")

const devFlags = {
  storeBuild: false,
  cloudOn: true,
  socialOn: true,
  invitesOn: true,
  duetsOn: true,
  competitionsOn: true,
  marketplaceOn: true,
  diagnosticsOn: true,
  karaokeOn: true,
  performanceOn: true,
  dev: true,
}

const surfaces = new Set(getEnabledStackScreenNames(devFlags))
for (const required of ["SandboxHub", "ComponentPlayground", "FlowPlayground", "ScreenPreviewGallery", "ScreenPreviewScenario", "StorybookScreen"]) {
  assert.equal(surfaces.has(required), true, `missing dev sandbox route: ${required}`)
}

for (const [id, scenario] of Object.entries(flowScenarios)) {
  assert.ok(scenario.startRoute, `scenario ${id} must define startRoute`)
  assert.ok(Array.isArray(scenario.steps) && scenario.steps.length > 0, `scenario ${id} needs steps`)
}

for (const preview of orderedScreenPreviews) {
  assert.ok(preview.id, 'screen preview entry missing id')
  assert.ok(preview.title, `screen preview ${preview.id} missing title`)
}

const dark = buildTheme({ mode: "dark", motionPreset: "normal", reducedMotion: false })
const calm = buildTheme({ mode: "dark", motionPreset: "calm", reducedMotion: false })
const reduced = buildTheme({ mode: "dark", motionPreset: "normal", reducedMotion: true })
const light = buildTheme({ mode: "light", motionPreset: "snappy", reducedMotion: false })

assert.equal(calm.motion.normal > dark.motion.normal, true, "calm motion should be slower than normal")
assert.equal(reduced.motion.fast, 0, "reduced motion should disable animations")
assert.equal(light.colors.bg !== dark.colors.bg, true, "light and dark themes should differ")

console.log("sandbox smoke checks passed")
