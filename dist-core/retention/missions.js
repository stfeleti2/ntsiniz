"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyMissions = getDailyMissions;
const attemptsRepo_1 = require("@/core/storage/attemptsRepo");
const clipsRepo_1 = require("@/core/performance/clipsRepo");
const db_1 = require("@/core/storage/db");
const phraseGrader_1 = require("@/core/scoring/phraseGrader");
const keys_1 = require("@/core/time/keys");
const stateRepo_1 = require("./stateRepo");
const sessionsRepo_1 = require("@/core/storage/sessionsRepo");
async function hasPostToday(startMs, endMs) {
    const d = await (0, db_1.getDb)();
    // self-authored posts (offline) are stored with source=self and authorId=self person id.
    const rows = await (0, db_1.query)(d, `SELECT COUNT(1) as c FROM posts WHERE createdAt >= ? AND createdAt < ? AND source = 'self' AND hidden = 0;`, [startMs, endMs]);
    return Number(rows?.[0]?.c ?? 0) > 0;
}
async function getDailyMissions(nowMs = Date.now()) {
    const startMs = (0, keys_1.startOfDayMs)(nowMs);
    const endMs = startMs + 86400000;
    const dk = (0, keys_1.dayKey)(nowMs);
    const wk = (0, keys_1.weekKey)(nowMs);
    // Evaluate "Clean phrase" from attempts + clips today.
    const attempts = await (0, attemptsRepo_1.listAttemptsInRange)(startMs, endMs).catch(() => []);
    const clips = await (0, clipsRepo_1.listClipsInRange)(startMs, endMs).catch(() => []);
    const grades = [
        ...attempts.map((a) => (0, phraseGrader_1.gradePhraseFromMetrics)(a.metrics, { difficulty: 'standard' })),
        ...clips.map((c) => (0, phraseGrader_1.gradePhraseFromMetrics)(c.metrics, { difficulty: 'standard' })),
    ];
    const cleanCount = grades.filter((g) => g.label === 'perfect' || g.label === 'clean').length;
    const cleanDone = cleanCount > 0;
    const retention = await (0, stateRepo_1.getRetentionState)().catch(() => ({}));
    const sharedWin = retention?.dailyKey === dk ? !!retention?.daily?.sharedWin : false;
    const posted = await hasPostToday(startMs, endMs).catch(() => false);
    // Weekly goal: sessions with attempts.
    const wr = (0, keys_1.weekRangeMs)(nowMs);
    const rows = await (0, sessionsRepo_1.listSessionAggregatesInRange)(wr.startMs, wr.endMs).catch(() => []);
    const doneSessions = rows.filter((r) => r.attemptCount > 0).length;
    const goalSessions = Math.max(1, Math.min(14, Number(retention?.weekly?.goalSessions ?? 5)));
    const weekly = { key: wk, goalSessions, doneSessions, pct: Math.round((Math.min(1, doneSessions / goalSessions)) * 100) };
    const missions = [
        {
            id: 'cleanPhrase',
            title: 'Get 1 Clean phrase',
            subtitle: 'Hit “Clean” or “Perfect” once today.',
            done: cleanDone,
            pct: Math.max(0, Math.min(1, cleanCount / 1)),
            cta: cleanDone ? undefined : { kind: 'startSession', label: 'Start a quick session' },
        },
        {
            id: 'shareWin',
            title: 'Share a win',
            subtitle: 'Share your best take, clip, or score today.',
            done: sharedWin,
            cta: sharedWin ? undefined : { kind: 'shareLatest', label: 'Share your latest' },
        },
        {
            id: 'postOrReply',
            title: 'Show up in Community',
            subtitle: 'Post once (or reply to someone).',
            done: posted,
            cta: posted ? undefined : { kind: 'openCommunity', label: 'Open Community' },
        },
    ];
    return { dayKey: dk, missions, weekly };
}
