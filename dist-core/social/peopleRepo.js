"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSelfPerson = ensureSelfPerson;
exports.getSelfPerson = getSelfPerson;
exports.updateSelfProfile = updateSelfProfile;
exports.upsertFriendPerson = upsertFriendPerson;
exports.listFriends = listFriends;
exports.setBlocked = setBlocked;
exports.isPersonBlocked = isPersonBlocked;
const db_1 = require("@/core/storage/db");
const id_1 = require("@/core/util/id");
const enqueue_1 = require("@/core/cloud/enqueue");
const moderation_1 = require("./moderation");
function rowToPerson(r) {
    return {
        id: r.id,
        kind: r.kind,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        displayName: r.displayName,
        avatarSeed: r.avatarSeed ?? null,
        bio: r.bio ?? null,
        isBlocked: !!r.isBlocked,
    };
}
async function ensureSelfPerson() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM people WHERE kind = 'self' LIMIT 1;`, []);
    if (rows[0])
        return rowToPerson(rows[0]);
    const now = Date.now();
    const me = {
        id: (0, id_1.id)('me'),
        kind: 'self',
        createdAt: now,
        updatedAt: now,
        displayName: 'You',
        avatarSeed: String(Math.floor(Math.random() * 1e9)),
        bio: null,
        isBlocked: false,
    };
    await (0, db_1.exec)(d, `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [me.id, me.kind, me.createdAt, me.updatedAt, me.displayName, me.avatarSeed ?? null, me.bio ?? null, 0]);
    return me;
}
async function getSelfPerson() {
    return ensureSelfPerson();
}
async function updateSelfProfile(input) {
    const d = await (0, db_1.getDb)();
    const me = await ensureSelfPerson();
    const name = input.displayName != null ? input.displayName.trim() : me.displayName;
    const v = (0, moderation_1.validateDisplayName)(name);
    if (!v.ok)
        throw new Error(v.error ?? 'Invalid name');
    const bio = input.bio != null ? input.bio : me.bio;
    const updatedAt = Date.now();
    await (0, db_1.exec)(d, `UPDATE people SET displayName = ?, bio = ?, updatedAt = ? WHERE id = ?;`, [name, bio ?? null, updatedAt, me.id]);
    const out = { ...me, displayName: name, bio: bio ?? null, updatedAt };
    await (0, enqueue_1.enqueueUpsert)('people', out.id, {
        id: out.id,
        createdAt: out.createdAt,
        updatedAt: out.updatedAt,
        displayName: out.displayName,
        avatarSeed: out.avatarSeed ?? null,
        bio: out.bio ?? null,
    }, out.updatedAt);
    return out;
}
async function upsertFriendPerson(input) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [input.id]);
    const now = Date.now();
    const displayName = (input.displayName ?? '').trim() || 'Friend';
    if (rows[0]) {
        // Keep block status.
        await (0, db_1.exec)(d, `UPDATE people SET kind = 'friend', displayName = ?, avatarSeed = ?, bio = ?, updatedAt = ? WHERE id = ?;`, [displayName, input.avatarSeed ?? null, input.bio ?? null, now, input.id]);
        const r = await (0, db_1.query)(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [input.id]);
        return rowToPerson(r[0]);
    }
    await (0, db_1.exec)(d, `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked) VALUES (?, 'friend', ?, ?, ?, ?, ?, 0);`, [input.id, now, now, displayName, input.avatarSeed ?? null, input.bio ?? null]);
    const r2 = await (0, db_1.query)(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [input.id]);
    return rowToPerson(r2[0]);
}
async function listFriends() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT * FROM people WHERE kind = 'friend' ORDER BY displayName ASC;`, []);
    return rows.map(rowToPerson);
}
async function setBlocked(personId, blocked) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `UPDATE people SET isBlocked = ?, updatedAt = ? WHERE id = ?;`, [blocked ? 1 : 0, Date.now(), personId]);
}
async function isPersonBlocked(personId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT isBlocked FROM people WHERE id = ? LIMIT 1;`, [personId]);
    return !!rows[0]?.isBlocked;
}
