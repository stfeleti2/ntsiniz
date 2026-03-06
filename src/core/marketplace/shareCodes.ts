import { b64UrlDecodeJson, b64UrlEncodeJson } from '@/core/social/base64'
import { ensureSelfPerson } from '@/core/social/peopleRepo'

export type CoachShareEnvelope = {
  v: 1
  kind: 'coach'
  createdAt: number
  expiresAt?: number
  payload: {
    coachId: string
    coachName: string
  }
}

export function encodeCoachCode(env: CoachShareEnvelope): string {
  return b64UrlEncodeJson(env)
}

export function decodeCoachCode(code: string): CoachShareEnvelope {
  return b64UrlDecodeJson<CoachShareEnvelope>(code)
}

export async function createMyCoachShareCode(): Promise<string> {
  const me = await ensureSelfPerson()
  const env: CoachShareEnvelope = {
    v: 1,
    kind: 'coach',
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 86400000,
    payload: { coachId: me.id, coachName: me.displayName },
  }
  return encodeCoachCode(env)
}
