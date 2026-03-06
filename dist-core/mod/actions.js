"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hidePostWithAudit = hidePostWithAudit;
exports.hideCommentWithAudit = hideCommentWithAudit;
exports.hideClipWithAudit = hideClipWithAudit;
exports.blockPersonWithAudit = blockPersonWithAudit;
const postsRepo_1 = require("@/core/social/postsRepo");
const clipsRepo_1 = require("@/core/performance/clipsRepo");
const peopleRepo_1 = require("@/core/social/peopleRepo");
const auditRepo_1 = require("./auditRepo");
const rateLimit_1 = require("./rateLimit");
async function hidePostWithAudit(input) {
    if (!(0, rateLimit_1.allowAction)(`hide_post:${input.actorId}`, 10, 60_000))
        throw new Error('Rate limited');
    await (0, postsRepo_1.hidePost)(input.postId);
    await (0, auditRepo_1.addAuditEntry)({
        actorId: input.actorId,
        actorName: input.actorName,
        action: 'hide',
        targetKind: 'post',
        targetId: input.postId,
        metaJson: '{}',
    });
}
async function hideCommentWithAudit(input) {
    if (!(0, rateLimit_1.allowAction)(`hide_comment:${input.actorId}`, 20, 60_000))
        throw new Error('Rate limited');
    await (0, postsRepo_1.hideComment)(input.commentId);
    await (0, auditRepo_1.addAuditEntry)({
        actorId: input.actorId,
        actorName: input.actorName,
        action: 'hide',
        targetKind: 'comment',
        targetId: input.commentId,
        metaJson: '{}',
    });
}
async function hideClipWithAudit(input) {
    if (!(0, rateLimit_1.allowAction)(`hide_clip:${input.actorId}`, 10, 60_000))
        throw new Error('Rate limited');
    await (0, clipsRepo_1.hideClip)(input.clipId);
    await (0, auditRepo_1.addAuditEntry)({
        actorId: input.actorId,
        actorName: input.actorName,
        action: 'hide',
        targetKind: 'clip',
        targetId: input.clipId,
        metaJson: '{}',
    });
}
async function blockPersonWithAudit(input) {
    if (!(0, rateLimit_1.allowAction)(`block:${input.actorId}`, 20, 60_000))
        throw new Error('Rate limited');
    await (0, peopleRepo_1.setBlocked)(input.personId, true);
    await (0, auditRepo_1.addAuditEntry)({
        actorId: input.actorId,
        actorName: input.actorName,
        action: 'block',
        targetKind: 'person',
        targetId: input.personId,
        metaJson: JSON.stringify({ reason: input.reason ?? null }),
    });
}
