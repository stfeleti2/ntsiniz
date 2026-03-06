import fs from 'node:fs'
import path from 'node:path'
import Module from 'node:module'

const root = process.cwd()
const distRoot = path.join(root, 'dist-tests')

const stubs: Record<string, string> = {
  'react-native': path.join(distRoot, 'ui/testing/stubs/react-native.js'),
  'react-native-reanimated': path.join(distRoot, 'ui/testing/stubs/react-native-reanimated.js'),
  'expo-linear-gradient': path.join(distRoot, 'ui/testing/stubs/expo-linear-gradient.js'),
  'expo-haptics': path.join(distRoot, 'ui/testing/stubs/expo-haptics.js'),
  'expo-constants': path.join(distRoot, 'ui/testing/stubs/expo-constants.js'),
  'expo-av': path.join(distRoot, 'ui/testing/stubs/expo-av.js'),
  'expo-file-system': path.join(distRoot, 'ui/testing/stubs/expo-file-system.js'),
  'expo-file-system/legacy': path.join(distRoot, 'ui/testing/stubs/expo-file-system.js'),
  'ntsiniz-audio-route': path.join(distRoot, 'ui/testing/stubs/ntsiniz-audio-route.js'),
}

function resolveAliasPath(request: string): string {
  const rel = request.slice(2) // strip "@/..."
  const base = path.join(distRoot, rel)
  const candidates = [`${base}.js`, `${base}.jsx`, path.join(base, 'index.js')]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return `${base}.js`
}

const modAny = Module as any
const originalResolveFilename = modAny._resolveFilename.bind(Module)

modAny._resolveFilename = function patchedResolveFilename(
  request: string,
  parent: any,
  isMain: boolean,
  options: any,
) {
  if (process.env.UI_TEST_TRACE === '1') {
    console.error('[ui-test-resolve]', request)
  }
  if (request.startsWith('@/')) {
    return resolveAliasPath(request)
  }
  const stub = stubs[request]
  if (stub) return stub
  return originalResolveFilename(request, parent, isMain, options)
}

;(globalThis as any).__DEV__ = false
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
;(globalThis as any).requestAnimationFrame = (cb: (...args: any[]) => void) => setTimeout(cb, 0)

const filteredWarning = 'react-test-renderer is deprecated. See https://react.dev/warnings/react-test-renderer'
const originalWarn = console.warn.bind(console)
const originalError = console.error.bind(console)

console.warn = (...args: unknown[]) => {
  const first = typeof args[0] === 'string' ? args[0] : ''
  if (first.includes(filteredWarning)) return
  originalWarn(...(args as Parameters<typeof console.warn>))
}

console.error = (...args: unknown[]) => {
  const first = typeof args[0] === 'string' ? args[0] : ''
  if (first.includes(filteredWarning)) return
  originalError(...(args as Parameters<typeof console.error>))
}
