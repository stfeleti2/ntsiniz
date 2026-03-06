import { b64UrlEncodeJson, b64UrlDecodeJson } from './base64'
import type { ChallengeSubmission, Person, Post } from './types'
import { ensureSelfPerson, upsertFriendPerson } from './peopleRepo'
import { upsertSubmission } from './submissionsRepo'
import { upsertImportedPost } from './postsRepo'

export type ShareEnvelope =
  | {
      v: 1
      kind: 'profile'
      createdAt: number
      expiresAt?: number
      payload: { person: Pick<Person, 'id' | 'displayName' | 'avatarSeed' | 'bio'> }
    }
  | {
      v: 1
      kind: 'submission'
      createdAt: number
      expiresAt?: number
      payload: { person: Pick<Person, 'id' | 'displayName' | 'avatarSeed' | 'bio'>; submission: Omit<ChallengeSubmission, 'id' | 'userId' | 'displayName' | 'source' | 'createdAt' | 'updatedAt'> }
    }
  | {
      v: 1
      kind: 'post'
      createdAt: number
      expiresAt?: number
      payload: { person: Pick<Person, 'id' | 'displayName' | 'avatarSeed' | 'bio'>; post: Omit<Post, 'id' | 'authorId' | 'authorName' | 'source' | 'createdAt' | 'updatedAt'> }
    }

export function encodeShareEnvelope(env: ShareEnvelope): string {
  return b64UrlEncodeJson(env)
}

export function decodeShareEnvelope(code: string): ShareEnvelope {
  return b64UrlDecodeJson<ShareEnvelope>(code)
}

export async function createMyProfileCode(): Promise<string> {
  const me = await ensureSelfPerson()
  const env: ShareEnvelope = {
    v: 1,
    kind: 'profile',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 86400000, // 60 days
    payload: { person: { id: me.id, displayName: me.displayName, avatarSeed: me.avatarSeed ?? null, bio: me.bio ?? null } },
  }
  return encodeShareEnvelope(env)
}

export async function createMySubmissionCode(submission: Omit<ChallengeSubmission, 'id' | 'userId' | 'displayName' | 'source' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const me = await ensureSelfPerson()
  const env: ShareEnvelope = {
    v: 1,
    kind: 'submission',
    createdAt: Date.now(),
    expiresAt: Date.now() + 14 * 86400000,
    payload: {
      person: { id: me.id, displayName: me.displayName, avatarSeed: me.avatarSeed ?? null, bio: me.bio ?? null },
      submission,
    },
  }
  return encodeShareEnvelope(env)
}

export async function createMyPostCode(post: Omit<Post, 'id' | 'authorId' | 'authorName' | 'source' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const me = await ensureSelfPerson()
  const env: ShareEnvelope = {
    v: 1,
    kind: 'post',
    createdAt: Date.now(),
    expiresAt: Date.now() + 14 * 86400000,
    payload: {
      person: { id: me.id, displayName: me.displayName, avatarSeed: me.avatarSeed ?? null, bio: me.bio ?? null },
      post,
    },
  }
  return encodeShareEnvelope(env)
}

export async function importShareCode(code: string): Promise<{ kind: ShareEnvelope['kind']; imported: boolean; message: string }>
{
  const env = decodeShareEnvelope(code)
  if (env.v !== 1) throw new Error('Unsupported code version')
  if (env.expiresAt && Date.now() > env.expiresAt) return { kind: env.kind, imported: false, message: 'This code has expired.' }

  const person = await upsertFriendPerson({
    id: env.payload.person.id,
    displayName: env.payload.person.displayName,
    avatarSeed: env.payload.person.avatarSeed ?? null,
    bio: env.payload.person.bio ?? null,
  })

  if (env.kind === 'profile') {
    return { kind: 'profile', imported: true, message: `Added ${person.displayName}` }
  }

  if (env.kind === 'submission') {
    await upsertSubmission({
      period: env.payload.submission.period,
      periodKey: env.payload.submission.periodKey,
      challengeId: env.payload.submission.challengeId,
      userId: person.id,
      displayName: person.displayName,
      score: env.payload.submission.score,
      details: env.payload.submission.details,
      source: 'import',
      expiresAt: env.expiresAt,
    })
    return { kind: 'submission', imported: true, message: `Imported ${person.displayName}'s score` }
  }

  if (env.kind === 'post') {
    await upsertImportedPost({
      authorId: person.id,
      authorName: person.displayName,
      type: env.payload.post.type,
      title: env.payload.post.title,
      body: env.payload.post.body,
      payload: env.payload.post.payload,
      expiresAt: env.expiresAt,
    })
    return { kind: 'post', imported: true, message: `Imported a post from ${person.displayName}` }
  }

  return { kind: 'profile', imported: false, message: 'Unknown code.' }
}
