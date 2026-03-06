"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = getLeaderboard;
const submissionsRepo_1 = require("@/core/social/submissionsRepo");
const peopleRepo_1 = require("@/core/social/peopleRepo");
async function getLeaderboard(input) {
    const subs = await (0, submissionsRepo_1.listSubmissionsForChallenge)(input);
    const out = [];
    for (const s of subs) {
        if (await (0, peopleRepo_1.isPersonBlocked)(s.userId).catch(() => false))
            continue;
        out.push(s);
    }
    return out;
}
