import test from 'node:test'
import assert from 'node:assert/strict'
import { compareVersions, isVersionInRange } from '../util/version.js'

test('compareVersions orders semver-ish versions', () => {
  assert.equal(compareVersions('1.2.3', '1.2.3'), 0)
  assert.equal(compareVersions('1.2.3', '1.2.4'), -1)
  assert.equal(compareVersions('1.2.10', '1.2.4'), 1)
  assert.equal(compareVersions('1.2.3-beta', '1.2.3'), 0)
})

test('isVersionInRange respects min/max', () => {
  assert.equal(isVersionInRange({ version: '1.0.0', min: '0.9.0', max: '1.0.0' }), true)
  assert.equal(isVersionInRange({ version: '0.8.9', min: '0.9.0', max: '1.0.0' }), false)
  assert.equal(isVersionInRange({ version: '1.0.1', min: '0.9.0', max: '1.0.0' }), false)
})
