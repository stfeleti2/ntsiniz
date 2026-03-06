"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDailyAverages = computeDailyAverages;
exports.computeWeeklyReport = computeWeeklyReport;
function startOfDayMs(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function addDaysMs(ts, days) {
    return ts + days * 24 * 60 * 60 * 1000;
}
function avg(xs) {
    if (!xs.length)
        return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function computeDailyAverages(aggs, startMs, endMs) {
    const map = new Map();
    for (const s of aggs) {
        if (s.startedAt < startMs || s.startedAt >= endMs)
            continue;
        const day = startOfDayMs(s.startedAt);
        const arr = map.get(day) ?? [];
        arr.push(s.avgScore);
        map.set(day, arr);
    }
    const days = [];
    for (let d = startOfDayMs(startMs); d < endMs; d = addDaysMs(d, 1)) {
        const arr = map.get(d) ?? [];
        if (arr.length)
            days.push({ dayMs: d, avgScore: Math.round(avg(arr)) });
    }
    return days;
}
function avgScoreFromAttempts(attempts) {
    if (!attempts.length)
        return null;
    return avg(attempts.map((a) => a.score));
}
function avgWobbleFromAttempts(attempts) {
    const xs = attempts
        .map((a) => a?.metrics?.wobbleCents)
        .filter((v) => typeof v === "number" && Number.isFinite(v));
    if (!xs.length)
        return null;
    return avg(xs);
}
function avgMetric(attempts, pick) {
    const xs = attempts
        .map((a) => pick(a))
        .filter((v) => typeof v === "number" && Number.isFinite(v));
    if (!xs.length)
        return null;
    return avg(xs);
}
function groupAvg(atts, keyOf) {
    const m = new Map();
    for (const a of atts) {
        const key = keyOf(a);
        const cur = m.get(key) ?? { scores: [], n: 0 };
        cur.scores.push(a.score);
        cur.n += 1;
        m.set(key, cur);
    }
    const out = new Map();
    for (const [k, v] of m.entries())
        out.set(k, { avgScore: avg(v.scores), attempts: v.n });
    return out;
}
function computeStreaks(dayMsSorted) {
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
function mostImprovedDrill(attemptsThis, attemptsPrev) {
    const group = (atts) => {
        const m = new Map();
        for (const a of atts) {
            const arr = m.get(a.drillId) ?? [];
            arr.push(a.score);
            m.set(a.drillId, arr);
        }
        const out = new Map();
        for (const [k, v] of m.entries())
            out.set(k, avg(v));
        return out;
    };
    const thisMap = group(attemptsThis);
    const prevMap = group(attemptsPrev);
    let bestLabel = null;
    let bestDelta = null;
    for (const [drillId, thisAvg] of thisMap.entries()) {
        const prevAvg = prevMap.get(drillId);
        if (prevAvg == null)
            continue;
        const delta = thisAvg - prevAvg;
        if (bestDelta == null || delta > bestDelta) {
            bestDelta = delta;
            bestLabel = drillId;
        }
    }
    if (bestDelta == null || bestLabel == null)
        return { label: null, delta: null };
    return { label: bestLabel, delta: Math.round(bestDelta) };
}
function generateInsight(input) {
    const parts = [];
    if (typeof input.vsPrevWeekDelta === "number" && Math.abs(input.vsPrevWeekDelta) >= 3) {
        parts.push(`${input.vsPrevWeekDelta > 0 ? "Up" : "Down"} ${Math.abs(input.vsPrevWeekDelta)} vs last week`);
    }
    else if (input.sessions >= 2 && input.activeDays >= 2) {
        parts.push(`${input.activeDays} active days`);
    }
    else if (input.sessions >= 1) {
        parts.push(`${input.sessions} session${input.sessions === 1 ? "" : "s"} this week`);
    }
    if (typeof input.accuracyDeltaCents === "number" && input.accuracyDeltaCents >= 1.5) {
        parts.push(`Accuracy tighter (-${input.accuracyDeltaCents.toFixed(1)}c)`);
    }
    if (typeof input.wobbleDeltaCents === "number" && input.wobbleDeltaCents >= 1) {
        parts.push(`Stability up (-${input.wobbleDeltaCents.toFixed(1)}c wobble)`);
    }
    if (typeof input.voicedDeltaRatio === "number" && input.voicedDeltaRatio >= 0.05) {
        parts.push(`Voice consistency +${Math.round(input.voicedDeltaRatio * 100)}%`);
    }
    if (typeof input.speedDeltaMs === "number" && input.speedDeltaMs >= 500) {
        parts.push(`Faster entry (-${Math.round(input.speedDeltaMs / 1000)}s)`);
    }
    if (!parts.length)
        return null;
    return parts.slice(0, 2).join(" • ");
}
function computeWeeklyReport(params) {
    const { weekStartMs, aggs, attempts, prevAttempts } = params;
    const weekStartDay = startOfDayMs(weekStartMs);
    const weekEnd = addDaysMs(weekStartDay, 7);
    const sessionsInWeek = aggs.filter((s) => s.startedAt >= weekStartDay && s.startedAt < weekEnd);
    const activeDaySet = new Set();
    for (const s of sessionsInWeek)
        activeDaySet.add(startOfDayMs(s.startedAt));
    const dayMsSorted = Array.from(activeDaySet).sort((a, b) => a - b);
    const { bestStreakDays, currentStreakDays } = computeStreaks(dayMsSorted);
    const minutesTrained = (() => {
        const ds = sessionsInWeek
            .map((s) => {
            const end = s.endedAt;
            if (typeof end !== "number" || !Number.isFinite(end))
                return 0;
            const dur = Math.max(0, Math.min(end, weekEnd) - Math.max(s.startedAt, weekStartDay));
            return dur;
        })
            .reduce((a, b) => a + b, 0);
        if (!ds)
            return null;
        return Math.max(0, Math.round(ds / 60000));
    })();
    const avgScore = attempts.length ? Math.round(avg(attempts.map((a) => a.score))) : null;
    const bestScore = sessionsInWeek.length ? Math.round(Math.max(...sessionsInWeek.map((s) => s.avgScore))) : null;
    const prevAvg = avgScoreFromAttempts(prevAttempts);
    const vsPrevWeekDelta = prevAvg == null || avgScore == null ? null : Math.round(avgScore - prevAvg);
    const mi = mostImprovedDrill(attempts, prevAttempts);
    const dailyAverages = computeDailyAverages(aggs, weekStartDay, weekEnd);
    const wobbleAvg = avgWobbleFromAttempts(attempts);
    const prevWobbleAvg = avgWobbleFromAttempts(prevAttempts);
    const wobbleDelta = wobbleAvg == null || prevWobbleAvg == null ? null : Number((prevWobbleAvg - wobbleAvg).toFixed(1));
    // extra proof metrics (accuracy/stability/speed/voice)
    const accAvg = avgMetric(attempts, (a) => a?.metrics?.avgAbsCents);
    const prevAccAvg = avgMetric(prevAttempts, (a) => a?.metrics?.avgAbsCents);
    const accDelta = accAvg == null || prevAccAvg == null ? null : Number((prevAccAvg - accAvg).toFixed(1));
    const voicedAvg = avgMetric(attempts, (a) => a?.metrics?.voicedRatio);
    const prevVoicedAvg = avgMetric(prevAttempts, (a) => a?.metrics?.voicedRatio);
    const voicedDelta = voicedAvg == null || prevVoicedAvg == null ? null : Number((voicedAvg - prevVoicedAvg).toFixed(3));
    const confAvg = avgMetric(attempts, (a) => a?.metrics?.confidenceAvg);
    const prevConfAvg = avgMetric(prevAttempts, (a) => a?.metrics?.confidenceAvg);
    const confDelta = confAvg == null || prevConfAvg == null ? null : Number((confAvg - prevConfAvg).toFixed(3));
    const speedAvg = avgMetric(attempts, (a) => a?.metrics?.timeToEnterMs);
    const prevSpeedAvg = avgMetric(prevAttempts, (a) => a?.metrics?.timeToEnterMs);
    const speedDelta = speedAvg == null || prevSpeedAvg == null ? null : Math.round(prevSpeedAvg - speedAvg);
    const drillIdThis = groupAvg(attempts, (a) => a.drillId);
    const drillIdPrev = groupAvg(prevAttempts, (a) => a.drillId);
    const drillIdBreakdown = Array.from(drillIdThis.entries())
        .map(([drillId, v]) => {
        const prev = drillIdPrev.get(drillId);
        const delta = prev ? Math.round(v.avgScore - prev.avgScore) : null;
        return { drillId, avgScore: Math.round(v.avgScore), delta, attempts: v.attempts };
    })
        .sort((a, b) => (b.delta ?? -999) - (a.delta ?? -999))
        .slice(0, 6);
    const typeThis = groupAvg(attempts, (a) => String(a?.metrics?.drillType ?? "unknown"));
    const typePrev = groupAvg(prevAttempts, (a) => String(a?.metrics?.drillType ?? "unknown"));
    const drillTypeBreakdown = Array.from(typeThis.entries())
        .map(([type, v]) => {
        const prev = typePrev.get(type);
        const delta = prev ? Math.round(v.avgScore - prev.avgScore) : null;
        return { type, avgScore: Math.round(v.avgScore), delta, attempts: v.attempts };
    })
        .sort((a, b) => b.avgScore - a.avgScore);
    const topInsight = generateInsight({
        avgScore,
        vsPrevWeekDelta,
        activeDays: activeDaySet.size,
        sessions: sessionsInWeek.length,
        accuracyDeltaCents: accDelta,
        wobbleDeltaCents: wobbleDelta,
        voicedDeltaRatio: voicedDelta,
        speedDeltaMs: speedDelta,
    });
    return {
        weekStartMs: weekStartDay,
        weekEndMs: weekEnd,
        sessions: sessionsInWeek.length,
        activeDays: activeDaySet.size,
        minutesTrained,
        bestStreakDays,
        currentStreakDays,
        avgScore,
        bestScore,
        vsPrevWeekDelta,
        mostImprovedLabel: mi.label,
        mostImprovedDelta: mi.delta,
        wobbleAvgCents: wobbleAvg == null ? null : Number(wobbleAvg.toFixed(1)),
        wobbleDeltaCents: wobbleDelta,
        accuracyAvgAbsCents: accAvg == null ? null : Number(accAvg.toFixed(1)),
        accuracyDeltaCents: accDelta,
        voicedAvgRatio: voicedAvg == null ? null : Number(voicedAvg.toFixed(3)),
        voicedDeltaRatio: voicedDelta,
        confidenceAvg: confAvg == null ? null : Number(confAvg.toFixed(3)),
        confidenceDelta: confDelta,
        speedAvgMs: speedAvg == null ? null : Math.round(speedAvg),
        speedDeltaMs: speedDelta,
        drillTypeBreakdown,
        drillIdBreakdown,
        topInsight,
        dailyAverages,
    };
}
