"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfDay = startOfDay;
exports.toDayKey = toDayKey;
exports.computeCurrentStreak = computeCurrentStreak;
exports.computeStreakFromAggregates = computeStreakFromAggregates;
const heatmap_1 = require("./heatmap");
function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function toDayKey(ts) {
    return startOfDay(ts);
}
function computeCurrentStreak(days, shieldedDayKeys = []) {
    const sorted = [...days].sort((a, b) => a.dayMs - b.dayMs);
    const active = new Set(sorted.filter((d) => d.sessions > 0).map((d) => toDayKey(d.dayMs)));
    for (const k of shieldedDayKeys)
        active.add(toDayKey(k));
    let streak = 0;
    let cursor = startOfDay(Date.now());
    while (active.has(toDayKey(cursor))) {
        streak += 1;
        cursor -= 24 * 60 * 60 * 1000;
    }
    return streak;
}
function computeStreakFromAggregates(aggs, shieldedDayKeys = []) {
    const normalized = aggs.map((a, i) => ({ id: `agg_${i}`, ...a }));
    const hm = (0, heatmap_1.computeHeatmapDays)({ aggs: normalized, endMs: Date.now(), days: 30 });
    return computeCurrentStreak(hm, shieldedDayKeys);
}
