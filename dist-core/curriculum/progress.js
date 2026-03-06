"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfDay = startOfDay;
exports.todayKey = todayKey;
exports.isoDate = isoDate;
exports.getCurriculumDayIndex = getCurriculumDayIndex;
exports.getCurriculumState = getCurriculumState;
exports.getTodayDay = getTodayDay;
exports.markDayCompleted = markDayCompleted;
exports.markTodayCompleted = markTodayCompleted;
const userStateRepo_1 = require("@/core/storage/userStateRepo");
function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function todayKey(now = Date.now()) {
    return startOfDay(now);
}
function isoDate(now = Date.now()) {
    const d = new Date(now);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
async function getCurriculumDayIndex() {
    const st = await (0, userStateRepo_1.getUserState)();
    return st.curriculum?.dayIndex ?? 0;
}
async function getCurriculumState(curr) {
    const st = await (0, userStateRepo_1.getUserState)();
    const key = todayKey();
    const c = st.curriculum ?? { dayIndex: 0, completedDayKeys: [] };
    const dayIndex = c.dayIndex ?? 0;
    const completedDayKeys = c.completedDayKeys ?? [];
    const doneToday = completedDayKeys.includes(key);
    // If you already completed today, keep showing the day you did, and lock the next day until tomorrow.
    const displayIndex = doneToday ? Math.max(0, dayIndex - 1) : dayIndex;
    const clamp = (i) => Math.max(0, Math.min(curr.days.length - 1, i));
    const todayDay = curr.days.length ? curr.days[clamp(displayIndex)] : null;
    const nextDay = dayIndex < curr.days.length ? curr.days[dayIndex] : null;
    const total = curr.days.length;
    const doneCount = Math.max(0, Math.min(total, dayIndex));
    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    return { dayIndex, displayIndex, doneToday, todayDay, nextDay, doneCount, total, pct };
}
async function getTodayDay(curr) {
    const st = await getCurriculumState(curr);
    return st.todayDay;
}
/**
 * Mark a curriculum day as completed for *today*.
 *
 * Important: we only advance the curriculum if the completed day matches the current dayIndex.
 * This prevents “redo an old day” from accidentally progressing the plan.
 */
async function markDayCompleted(curr, completedDayId) {
    const st = await (0, userStateRepo_1.getUserState)();
    const key = todayKey();
    const c = st.curriculum ?? { dayIndex: 0, completedDayKeys: [] };
    const currentDay = curr.days[Math.max(0, Math.min(curr.days.length - 1, c.dayIndex ?? 0))];
    const isCurrent = currentDay?.id === completedDayId;
    const already = c.completedDayKeys.includes(key);
    // Only “consume” today's completion if we did the correct day.
    if (isCurrent && !already) {
        c.completedDayKeys = [...c.completedDayKeys, key];
        // Advance to next day (but don't run past end)
        const nextIdx = Math.min(curr.days.length, (c.dayIndex ?? 0) + 1);
        c.dayIndex = nextIdx;
    }
    st.curriculum = c;
    await (0, userStateRepo_1.upsertUserState)(st);
}
async function markTodayCompleted(curr) {
    const day = await getTodayDay(curr);
    if (!day)
        return;
    await markDayCompleted(curr, day.id);
}
