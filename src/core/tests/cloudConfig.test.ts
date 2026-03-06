import test from 'node:test'
import assert from 'node:assert/strict'

import { getCloudConfig } from '../cloud/config.js'

test('getCloudConfig: cloudAutoSync defaults to false unless explicitly enabled', () => {
  const real = (globalThis as any).expo
  // config.ts reads from expo-constants; in node tests we can only assert the logic by
  // verifying the default branch when extra is missing.
  // If this test fails in CI due to expo-constants behavior, switch to an injected config shim.

  const c = getCloudConfig()
  assert.equal(c.cloudAutoSync, false)

  ;(globalThis as any).expo = real
})
