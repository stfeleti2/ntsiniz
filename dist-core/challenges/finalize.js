"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeChallengeSubmissionsForSession = finalizeChallengeSubmissionsForSession;
const attemptsRepo_1 = require("@/core/storage/attemptsRepo");
const sessionMeta_1 = require("@/core/profile/sessionMeta");
const peopleRepo_1 = require("@/core/social/peopleRepo");
const submissionsRepo_1 = require("@/core/social/submissionsRepo");
const dailyChallenge_1 = require("./dailyChallenge");
const progress_1 = require("@/core/curriculum/progress");
const weeklyChallenges_1 = require("./weeklyChallenges");
const week_1 = require("@/core/time/week");
function bestScoreForDrill(attempts, drillId) {
    let best = null;
    for (const a of attempts) {
        if (a.drillId !== drillId)
            continue;
        if (best == null || a.score > best)
            best = a.score;
    }
    return best;
}
async function finalizeChallengeSubmissionsForSession(sessionId, now = Date.now()) {
    const meta = (0, sessionMeta_1.getSessionMeta)(sessionId);
    if (!meta)
        return;
    const me = await (0, peopleRepo_1.ensureSelfPerson)();
    const attempts = await (0, attemptsRepo_1.listAttemptsBySession)(sessionId).catch(() => []);
    // Daily challenge submission
    if (meta.dailyChallenge) {
        const c = (0, dailyChallenge_1.getDailyChallenge)(now);
        const best = bestScoreForDrill(attempts, c.drillId);
        if (best != null) {
            await (0, submissionsRepo_1.upsertSubmission)({
                period: 'daily',
                periodKey: (0, progress_1.isoDate)(now),
                challengeId: c.id,
                userId: me.id,
                displayName: me.displayName,
                score: best,
                details: { drillId: c.drillId, title: c.title, target: c.targetScore },
                source: 'self',
                expiresAt: now + 21 * 86400000,
            });
        }
    }
    // Weekly challenge submission
    if (meta.weeklyChallengeId) {
        const wk = (0, weeklyChallenges_1.getWeeklyChallengeById)(meta.weeklyChallengeId);
        if (wk) {
            const bestByDrill = {};
            let sum = 0;
            let count = 0;
            for (const id of wk.drillIds) {
                const best = bestScoreForDrill(attempts, id);
                if (best != null) {
                    bestByDrill[id] = best;
                    sum += best;
                    count += 1;
                }
            }
            const avg = count ? sum / count : 0;
            const periodKey = meta.weeklyPeriodKey ?? (0, week_1.getIsoWeekKey)(now);
            await (0, submissionsRepo_1.upsertSubmission)({
                period: 'weekly',
                periodKey,
                challengeId: wk.id,
                userId: me.id,
                displayName: me.displayName,
                score: avg,
                details: {
                    title: wk.title,
                    subtitle: wk.subtitle,
                    drillIds: wk.drillIds,
                    completed: count,
                    total: wk.drillIds.length,
                    bestByDrill,
                    targetAvg: wk.targetAvg,
                },
                source: 'self',
                expiresAt: now + 60 * 86400000,
            });
        }
    }
}
