"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfDayMs = startOfDayMs;
exports.computeStreaksFromDayList = computeStreaksFromDayList;
exports.streaksFromAggregates = streaksFromAggregates;
function startOfDayMs(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function computeStreaksFromDayList(dayMsSorted) {
    const day = 24 * 60 * 60 * 1000;
    if (!dayMsSorted.length)
        return { bestStreakDays: 0, currentStreakDays: 0 };
    let best = 1;
    let cur = 1;
    for (let i = 1; i < dayMsSorted.length; i++) {
        if (dayMsSorted[i] === dayMsSorted[i - 1] + day)
            cur += 1;
        else
            cur = 1;
        if (cur > best)
            best = cur;
    }
    return { bestStreakDays: best, currentStreakDays: cur };
}
function streaksFromAggregates(aggs) {
    const set = new Set();
    for (const s of aggs)
        set.add(startOfDayMs(s.startedAt));
    const days = Array.from(set).sort((a, b) => a - b);
    return { days, ...computeStreaksFromDayList(days) };
}
