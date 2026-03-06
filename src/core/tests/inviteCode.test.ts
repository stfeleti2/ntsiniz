import test from 'node:test'
import assert from 'node:assert/strict'
import { makeInviteCode, parseInviteCode } from '../util/inviteCode.js'

test('invite codes round-trip and validate checksum', () => {
  const userId = 'user_01HXY9KZ2ZQ8W3R9S5T6U7V8W9'
  const code = makeInviteCode(userId)
  const parsed = parseInviteCode(code)
  assert.ok(parsed, 'expected parse to succeed')
  assert.equal(parsed!.userId, userId)

  // corruption should fail
  const bad = code.replace(/.$/, (ch: string) => (ch === 'A' ? 'B' : 'A'))
  assert.equal(parseInviteCode(bad), null)
})
