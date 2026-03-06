"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCloudSelfId = ensureCloudSelfId;
const db_1 = require("@/core/storage/db");
// When cloud is enabled, we want the local 'self' person id to match the cloud user id.
// This makes share codes, follows, and future sync stable across devices.
async function ensureCloudSelfId(remoteUserId, _email) {
    const d = await (0, db_1.getDb)();
    const selfRows = await (0, db_1.query)(d, `SELECT * FROM people WHERE kind = 'self' LIMIT 1;`, []);
    if (!selfRows[0])
        return;
    const me = selfRows[0];
    const oldId = me.id;
    const newId = remoteUserId;
    if (!newId || oldId === newId)
        return;
    const existing = await (0, db_1.query)(d, `SELECT * FROM people WHERE id = ? LIMIT 1;`, [newId]);
    const now = Date.now();
    if (!existing[0]) {
        await (0, db_1.exec)(d, `INSERT INTO people (id, kind, createdAt, updatedAt, displayName, avatarSeed, bio, isBlocked)
       VALUES (?, 'self', ?, ?, ?, ?, ?, 0);`, [newId, me.createdAt, now, me.displayName, me.avatarSeed ?? null, me.bio ?? null]);
    }
    else {
        await (0, db_1.exec)(d, `UPDATE people SET kind = 'self', displayName = ?, avatarSeed = COALESCE(?, avatarSeed), bio = COALESCE(?, bio), updatedAt = ? WHERE id = ?;`, [me.displayName, me.avatarSeed ?? null, me.bio ?? null, now, newId]);
    }
    // Rewrite references from old self id -> new self id.
    await (0, db_1.exec)(d, `UPDATE challenge_submissions SET userId = ? WHERE userId = ?;`, [newId, oldId]);
    await (0, db_1.exec)(d, `UPDATE posts SET authorId = ? WHERE authorId = ?;`, [newId, oldId]);
    await (0, db_1.exec)(d, `UPDATE post_reactions SET userId = ? WHERE userId = ?;`, [newId, oldId]);
    await (0, db_1.exec)(d, `UPDATE post_comments SET userId = ? WHERE userId = ?;`, [newId, oldId]);
    await (0, db_1.exec)(d, `UPDATE clips SET userId = ? WHERE userId = ?;`, [newId, oldId]);
    await (0, db_1.exec)(d, `UPDATE follows SET followerId = ? WHERE followerId = ?;`, [newId, oldId]);
    // If old row still exists and is not the same as newId, delete it.
    await (0, db_1.exec)(d, `DELETE FROM people WHERE id = ?;`, [oldId]);
}
