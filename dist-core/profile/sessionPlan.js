"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionPlan = createSessionPlan;
exports.createSessionPlanFromIds = createSessionPlanFromIds;
exports.getPlan = getPlan;
exports.advancePlan = advancePlan;
exports.markFail = markFail;
exports.resetFail = resetFail;
exports.dropPlan = dropPlan;
const plans = new Map();
function createSessionPlan(sessionId, pack, firstDrillId) {
    const cycle = ["match_note", "sustain", "slide", "interval", "melody_echo"];
    const findType = (id) => pack.drills.find((d) => d.id === id)?.type;
    const firstType = findType(firstDrillId) ?? "match_note";
    const idx = cycle.indexOf(firstType);
    const pickNextType = (step) => cycle[(idx + step) % cycle.length];
    const pickDrillByType = (type, fallback) => pack.drills.find((d) => d.type === type)?.id ?? fallback;
    const d1 = firstDrillId;
    const d2 = pickDrillByType(pickNextType(1), d1);
    const d3 = pickDrillByType(pickNextType(2), d2);
    const plan = { sessionId, drillIds: [d1, d2, d3], index: 0, failStreakByDrill: {} };
    plans.set(sessionId, plan);
    return plan;
}
/**
 * Create a plan from an explicit list of drill ids (used by Curriculum + Daily Challenge).
 */
function createSessionPlanFromIds(sessionId, drillIds) {
    const uniq = [];
    for (const id of drillIds) {
        if (typeof id !== 'string')
            continue;
        if (uniq.includes(id))
            continue;
        uniq.push(id);
    }
    const plan = { sessionId, drillIds: uniq.length ? uniq : [], index: 0, failStreakByDrill: {} };
    plans.set(sessionId, plan);
    return plan;
}
function getPlan(sessionId) {
    return plans.get(sessionId) ?? null;
}
function advancePlan(sessionId) {
    const p = plans.get(sessionId);
    if (!p)
        return null;
    p.index += 1;
    return p;
}
function markFail(sessionId, drillId) {
    const p = plans.get(sessionId);
    if (!p)
        return;
    p.failStreakByDrill[drillId] = (p.failStreakByDrill[drillId] ?? 0) + 1;
}
function resetFail(sessionId, drillId) {
    const p = plans.get(sessionId);
    if (!p)
        return;
    p.failStreakByDrill[drillId] = 0;
}
function dropPlan(sessionId) {
    plans.delete(sessionId);
}
