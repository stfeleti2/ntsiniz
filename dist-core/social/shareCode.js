"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeShareEnvelope = encodeShareEnvelope;
exports.decodeShareEnvelope = decodeShareEnvelope;
exports.createMyProfileCode = createMyProfileCode;
exports.createMySubmissionCode = createMySubmissionCode;
exports.createMyPostCode = createMyPostCode;
exports.importShareCode = importShareCode;
const base64_1 = require("./base64");
const peopleRepo_1 = require("./peopleRepo");
const submissionsRepo_1 = require("./submissionsRepo");
const postsRepo_1 = require("./postsRepo");
function encodeShareEnvelope(env) {
    return (0, base64_1.b64UrlEncodeJson)(env);
}
function decodeShareEnvelope(code) {
    return (0, base64_1.b64UrlDecodeJson)(code);
}
async function createMyProfileCode() {
    const me = await (0, peopleRepo_1.ensureSelfPerson)();
    const env = {
        v: 1,
        kind: 'profile',
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 86400000, // 60 days
        payload: { person: { id: me.id, displayName: me.displayName, avatarSeed: me.avatarSeed ?? null, bio: me.bio ?? null } },
    };
    return encodeShareEnvelope(env);
}
async function createMySubmissionCode(submission) {
    const me = await (0, peopleRepo_1.ensureSelfPerson)();
    const env = {
        v: 1,
        kind: 'submission',
        createdAt: Date.now(),
        expiresAt: Date.now() + 14 * 86400000,
        payload: {
            person: { id: me.id, displayName: me.displayName, avatarSeed: me.avatarSeed ?? null, bio: me.bio ?? null },
            submission,
        },
    };
    return encodeShareEnvelope(env);
}
async function createMyPostCode(post) {
    const me = await (0, peopleRepo_1.ensureSelfPerson)();
    const env = {
        v: 1,
        kind: 'post',
        createdAt: Date.now(),
        expiresAt: Date.now() + 14 * 86400000,
        payload: {
            person: { id: me.id, displayName: me.displayName, avatarSeed: me.avatarSeed ?? null, bio: me.bio ?? null },
            post,
        },
    };
    return encodeShareEnvelope(env);
}
async function importShareCode(code) {
    const env = decodeShareEnvelope(code);
    if (env.v !== 1)
        throw new Error('Unsupported code version');
    if (env.expiresAt && Date.now() > env.expiresAt)
        return { kind: env.kind, imported: false, message: 'This code has expired.' };
    const person = await (0, peopleRepo_1.upsertFriendPerson)({
        id: env.payload.person.id,
        displayName: env.payload.person.displayName,
        avatarSeed: env.payload.person.avatarSeed ?? null,
        bio: env.payload.person.bio ?? null,
    });
    if (env.kind === 'profile') {
        return { kind: 'profile', imported: true, message: `Added ${person.displayName}` };
    }
    if (env.kind === 'submission') {
        await (0, submissionsRepo_1.upsertSubmission)({
            period: env.payload.submission.period,
            periodKey: env.payload.submission.periodKey,
            challengeId: env.payload.submission.challengeId,
            userId: person.id,
            displayName: person.displayName,
            score: env.payload.submission.score,
            details: env.payload.submission.details,
            source: 'import',
            expiresAt: env.expiresAt,
        });
        return { kind: 'submission', imported: true, message: `Imported ${person.displayName}'s score` };
    }
    if (env.kind === 'post') {
        await (0, postsRepo_1.upsertImportedPost)({
            authorId: person.id,
            authorName: person.displayName,
            type: env.payload.post.type,
            title: env.payload.post.title,
            body: env.payload.post.body,
            payload: env.payload.post.payload,
            expiresAt: env.expiresAt,
        });
        return { kind: 'post', imported: true, message: `Imported a post from ${person.displayName}` };
    }
    return { kind: 'profile', imported: false, message: 'Unknown code.' };
}
