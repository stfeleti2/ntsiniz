import test from "node:test"
import assert from "node:assert/strict"

import { ensurePermissionOnce, resetPermissionGate } from "../audio/permissionGate"

test("ensurePermissionOnce: caches granted state", async () => {
  resetPermissionGate()
  let calls = 0
  const ensure = async () => {
    calls += 1
    return true
  }

  const a = await ensurePermissionOnce(ensure)
  const b = await ensurePermissionOnce(ensure)

  assert.equal(a, true)
  assert.equal(b, true)
  assert.equal(calls, 1)
})

test("ensurePermissionOnce: does not cache denial", async () => {
  resetPermissionGate()
  let calls = 0
  const ensure = async () => {
    calls += 1
    return calls >= 2
  }

  const a = await ensurePermissionOnce(ensure) // false
  const b = await ensurePermissionOnce(ensure) // true

  assert.equal(a, false)
  assert.equal(b, true)
  assert.equal(calls, 2)
})
