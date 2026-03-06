"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.follow = follow;
exports.unfollow = unfollow;
exports.isFollowing = isFollowing;
exports.listFollowingIds = listFollowingIds;
const db_1 = require("@/core/storage/db");
const enqueue_1 = require("@/core/cloud/enqueue");
async function follow(followerId, followeeId) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `INSERT INTO follows (followerId, followeeId, createdAt) VALUES (?, ?, ?)
     ON CONFLICT(followerId, followeeId) DO UPDATE SET createdAt = excluded.createdAt;`, [followerId, followeeId, now]);
    await (0, enqueue_1.enqueueUpsert)('follows', `${followerId}:${followeeId}`, { followerId, followeeId, createdAt: now, updatedAt: now }, now);
}
async function unfollow(followerId, followeeId) {
    const d = await (0, db_1.getDb)();
    await (0, db_1.exec)(d, `DELETE FROM follows WHERE followerId = ? AND followeeId = ?;`, [followerId, followeeId]);
    const now = Date.now();
    await (0, enqueue_1.enqueueDelete)('follows', `${followerId}:${followeeId}`, { followerId, followeeId }, now);
}
async function isFollowing(followerId, followeeId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT 1 FROM follows WHERE followerId = ? AND followeeId = ? LIMIT 1;`, [followerId, followeeId]);
    return !!rows[0];
}
async function listFollowingIds(followerId) {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT followeeId FROM follows WHERE followerId = ? ORDER BY createdAt DESC;`, [followerId]);
    return rows.map((r) => r.followeeId);
}
