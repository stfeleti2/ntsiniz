import { hidePost, hideComment } from '@/core/social/postsRepo'
import { hideClip } from '@/core/performance/clipsRepo'
import { setBlocked } from '@/core/social/peopleRepo'
import { addAuditEntry } from './auditRepo'
import { allowAction } from './rateLimit'

export async function hidePostWithAudit(input: { actorId: string; actorName: string; postId: string }) {
  if (!allowAction(`hide_post:${input.actorId}`, 10, 60_000)) throw new Error('Rate limited')
  await hidePost(input.postId)
  await addAuditEntry({
    actorId: input.actorId,
    actorName: input.actorName,
    action: 'hide',
    targetKind: 'post',
    targetId: input.postId,
    metaJson: '{}',
  })
}

export async function hideCommentWithAudit(input: { actorId: string; actorName: string; commentId: string }) {
  if (!allowAction(`hide_comment:${input.actorId}`, 20, 60_000)) throw new Error('Rate limited')
  await hideComment(input.commentId)
  await addAuditEntry({
    actorId: input.actorId,
    actorName: input.actorName,
    action: 'hide',
    targetKind: 'comment',
    targetId: input.commentId,
    metaJson: '{}',
  })
}

export async function hideClipWithAudit(input: { actorId: string; actorName: string; clipId: string }) {
  if (!allowAction(`hide_clip:${input.actorId}`, 10, 60_000)) throw new Error('Rate limited')
  await hideClip(input.clipId)
  await addAuditEntry({
    actorId: input.actorId,
    actorName: input.actorName,
    action: 'hide',
    targetKind: 'clip',
    targetId: input.clipId,
    metaJson: '{}',
  })
}

export async function blockPersonWithAudit(input: { actorId: string; actorName: string; personId: string; reason?: string }) {
  if (!allowAction(`block:${input.actorId}`, 20, 60_000)) throw new Error('Rate limited')
  await setBlocked(input.personId, true)
  await addAuditEntry({
    actorId: input.actorId,
    actorName: input.actorName,
    action: 'block',
    targetKind: 'person',
    targetId: input.personId,
    metaJson: JSON.stringify({ reason: input.reason ?? null }),
  })
}
