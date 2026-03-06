"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJourneyFeed = listJourneyFeed;
exports.listChallengeFeed = listChallengeFeed;
exports.listDiscoverFeed = listDiscoverFeed;
const postsRepo_1 = require("./postsRepo");
const followsRepo_1 = require("./followsRepo");
/**
 * A lightweight, offline-first feed engine.
 *
 * Goals:
 * - deterministic & simple (no ML)
 * - works fully offline
 * - allows “filters” that feel smart
 */
async function listJourneyFeed(limit = 80) {
    const all = await (0, postsRepo_1.listFeedPostsWithStats)(Math.max(limit, 120));
    return all.filter((p) => p.type === 'performance').slice(0, limit);
}
async function listChallengeFeed(limit = 80) {
    const all = await (0, postsRepo_1.listFeedPostsWithStats)(Math.max(limit, 120));
    return all.filter((p) => p.type === 'challenge').slice(0, limit);
}
async function listDiscoverFeed(filter, limit = 80, viewerId) {
    const all = await (0, postsRepo_1.listFeedPostsWithStats)(240);
    const engagement = (p) => p.stats.reactions * 2 + p.stats.comments * 3;
    const recencyBoost = (createdAt) => {
        // 0..1.5 boost over ~14 days
        const ageDays = (Date.now() - createdAt) / 86400000;
        return Math.max(0, 1.5 - ageDays / 10);
    };
    const diversifyByAuthor = (items, maxPerAuthor = 2) => {
        const counts = new Map();
        const out = [];
        for (const p of items) {
            const c = counts.get(p.authorId) ?? 0;
            if (c >= maxPerAuthor)
                continue;
            counts.set(p.authorId, c + 1);
            out.push(p);
            if (out.length >= limit)
                break;
        }
        return out;
    };
    if (filter === 'forYou') {
        // Mix: following (if any) + engagement + freshness + new creator boost + diversity.
        const following = viewerId ? await (0, followsRepo_1.listFollowingIds)(viewerId).catch(() => []) : [];
        const followingSet = new Set(following);
        const scored = all
            .map((p) => {
            const base = engagement(p);
            const followBoost = followingSet.has(p.authorId) ? 6 : 0;
            const newCreatorBoost = (p.stats.authorPostCount ?? 99) <= 2 ? 3 : 0;
            const freshness = recencyBoost(p.createdAt);
            const score = base * 1.2 + followBoost + newCreatorBoost + freshness;
            return { p, score };
        })
            .sort((a, b) => {
            if (a.score !== b.score)
                return b.score - a.score;
            return b.p.createdAt - a.p.createdAt;
        })
            .map((x) => x.p);
        return diversifyByAuthor(scored, 2);
    }
    if (filter === 'trending') {
        const cutoff = Date.now() - 14 * 86400000;
        return [...all]
            .filter((p) => p.createdAt >= cutoff)
            .sort((a, b) => {
            const ea = engagement(a);
            const eb = engagement(b);
            if (ea !== eb)
                return eb - ea;
            return b.createdAt - a.createdAt;
        })
            .slice(0, limit);
    }
    // newCreators
    const counts = new Map();
    for (const p of all)
        counts.set(p.authorId, (counts.get(p.authorId) ?? 0) + 1);
    return all
        .filter((p) => (counts.get(p.authorId) ?? 0) <= 2)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
}
