"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMilestones = computeMilestones;
exports.formatMilestone = formatMilestone;
function startOfDayMs(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function addDaysMs(ts, days) {
    return ts + days * 24 * 60 * 60 * 1000;
}
function labelFor(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function avg(xs) {
    if (!xs.length)
        return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function pickClosest(aggs, targetDayMs, windowDays = 2) {
    // 1) Prefer sessions on the exact target day.
    const sameDay = aggs.filter((s) => startOfDayMs(s.startedAt) === targetDayMs);
    if (sameDay.length)
        return sameDay;
    // 2) Prefer sessions within ±windowDays; if none, fall back to the single closest session.
    const windowStart = addDaysMs(targetDayMs, -windowDays);
    const windowEnd = addDaysMs(targetDayMs, windowDays + 1);
    const inWindow = aggs.filter((s) => s.startedAt >= windowStart && s.startedAt < windowEnd);
    if (inWindow.length)
        return inWindow;
    // closest by absolute day difference
    let best = null;
    let bestDist = Infinity;
    for (const s of aggs) {
        const dist = Math.abs(startOfDayMs(s.startedAt) - targetDayMs);
        if (dist < bestDist) {
            best = s;
            bestDist = dist;
        }
    }
    return best ? [best] : [];
}
function asPoint(label, rows) {
    if (!rows.length)
        return null;
    const score = Math.round(avg(rows.map((r) => r.avgScore)));
    const dateMs = startOfDayMs(rows[0].startedAt);
    return { label, dateMs, score };
}
function computeMilestones(aggs) {
    const xs = [...aggs]
        .filter((s) => Number.isFinite(s.avgScore))
        .sort((a, b) => a.startedAt - b.startedAt);
    if (!xs.length) {
        return { baseline: null, day7: null, day30: null, latest: null, last7Avg: null };
    }
    const baselineAgg = xs[0];
    const baselineDay = startOfDayMs(baselineAgg.startedAt);
    const baseline = asPoint("Baseline", [baselineAgg]);
    const day7Target = addDaysMs(baselineDay, 7);
    const day30Target = addDaysMs(baselineDay, 30);
    const day7 = asPoint("Day 7", pickClosest(xs, day7Target, 2));
    const day30 = asPoint("Day 30", pickClosest(xs, day30Target, 3));
    const latestAgg = xs[xs.length - 1];
    const latest = asPoint("Latest", [latestAgg]);
    const last7 = xs.slice(-7);
    const last7Avg = last7.length
        ? {
            label: "Last 7 avg",
            dateMs: startOfDayMs(latestAgg.startedAt),
            score: Math.round(avg(last7.map((r) => r.avgScore))),
        }
        : null;
    // Add human-friendly dates into labels at the UI layer; keep this pure & deterministic.
    return { baseline, day7, day30, latest, last7Avg };
}
function formatMilestone(point) {
    if (!point)
        return "—";
    return `${point.score} (${labelFor(point.dateMs)})`;
}
