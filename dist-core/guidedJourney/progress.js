"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJourneyV3Progress = getJourneyV3Progress;
exports.upsertJourneyV3Progress = upsertJourneyV3Progress;
exports.getFirstLessonForRoute = getFirstLessonForRoute;
exports.ensureJourneyV3Progress = ensureJourneyV3Progress;
exports.startJourneyFromPlacement = startJourneyFromPlacement;
exports.getCurrentJourneyV3 = getCurrentJourneyV3;
exports.getLessonsForStage = getLessonsForStage;
exports.getStageProgress = getStageProgress;
exports.completeJourneyLesson = completeJourneyLesson;
const userStateRepo_1 = require("@/core/storage/userStateRepo");
const loader_1 = require("./loader");
function unique(values) {
    return Array.from(new Set(values));
}
async function getJourneyV3Progress() {
    const state = await (0, userStateRepo_1.getUserState)();
    return {
        routeId: state.journeyV3?.routeId ?? null,
        stageId: state.journeyV3?.stageId ?? null,
        lessonId: state.journeyV3?.lessonId ?? null,
        unlockedLessonIds: state.journeyV3?.unlockedLessonIds ?? [],
        completedLessonIds: state.journeyV3?.completedLessonIds ?? [],
        completedStageIds: state.journeyV3?.completedStageIds ?? [],
        assessmentByStageId: state.journeyV3?.assessmentByStageId ?? {},
        compareBaseline: state.journeyV3?.compareBaseline ?? null,
        firstWinSnapshotId: state.journeyV3?.firstWinSnapshotId ?? null,
        firstWinCompletedAt: state.journeyV3?.firstWinCompletedAt ?? null,
    };
}
async function upsertJourneyV3Progress(next) {
    const state = await (0, userStateRepo_1.getUserState)();
    state.journeyV3 = next;
    await (0, userStateRepo_1.upsertUserState)(state);
}
function getFirstLessonForRoute(program, routeId) {
    const stageId = program.routesById[routeId]?.primaryStageIds[0] ?? program.stages[0]?.id;
    const stage = stageId ? program.stagesById[stageId] : program.stages[0];
    const lessonId = stage.lessonIds[0];
    return program.lessonsById[lessonId] ?? program.lessons[0];
}
async function ensureJourneyV3Progress(routeId = 'R4') {
    const program = (0, loader_1.loadGuidedJourneyProgram)();
    const current = await getJourneyV3Progress();
    if (current.routeId && current.stageId && current.lessonId)
        return current;
    const firstLesson = getFirstLessonForRoute(program, routeId);
    const next = {
        ...current,
        routeId,
        stageId: firstLesson.stageId,
        lessonId: firstLesson.id,
        unlockedLessonIds: unique([...(current.unlockedLessonIds ?? []), firstLesson.id]),
    };
    await upsertJourneyV3Progress(next);
    return next;
}
async function startJourneyFromPlacement(routeId, snapshotId) {
    const program = (0, loader_1.loadGuidedJourneyProgram)();
    const firstLesson = getFirstLessonForRoute(program, routeId);
    const next = {
        routeId,
        stageId: firstLesson.stageId,
        lessonId: firstLesson.id,
        unlockedLessonIds: [firstLesson.id],
        completedLessonIds: [],
        completedStageIds: [],
        assessmentByStageId: {},
        compareBaseline: null,
        firstWinSnapshotId: snapshotId ?? null,
        firstWinCompletedAt: Date.now(),
    };
    await upsertJourneyV3Progress(next);
    return next;
}
function getCurrentJourneyV3(program, progress) {
    const routeId = (progress.routeId ?? 'R4');
    const lesson = program.lessonsById[progress.lessonId ?? ''] ?? getFirstLessonForRoute(program, routeId);
    const stage = program.stagesById[lesson.stageId] ?? program.stages[0];
    return { route: program.routesById[routeId], stage, lesson };
}
function getLessonsForStage(program, stageId) {
    const stage = program.stagesById[stageId];
    return stage ? stage.lessonIds.map((id) => program.lessonsById[id]).filter(Boolean) : [];
}
function getStageProgress(program, progress, stageId) {
    const lessons = getLessonsForStage(program, stageId);
    const completedLessonIds = progress.completedLessonIds ?? [];
    const completed = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
    return {
        completed,
        total: lessons.length,
        pct: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
    };
}
async function completeJourneyLesson(lessonId) {
    const program = (0, loader_1.loadGuidedJourneyProgram)();
    const current = await ensureJourneyV3Progress();
    const lesson = program.lessonsById[lessonId];
    if (!lesson)
        return current;
    const completedLessonIds = unique([...(current.completedLessonIds ?? []), lessonId]);
    let completedStageIds = [...(current.completedStageIds ?? [])];
    const stage = program.stagesById[lesson.stageId];
    if (stage && stage.lessonIds.every((id) => completedLessonIds.includes(id))) {
        completedStageIds = unique([...completedStageIds, stage.id]);
    }
    const candidates = lesson.nextLessonIds.length
        ? lesson.nextLessonIds
        : stage?.lessonIds.filter((id) => !completedLessonIds.includes(id) && id !== lessonId) ?? [];
    let nextLesson = candidates.map((id) => program.lessonsById[id]).find((candidate) => canUnlockLesson(candidate, completedLessonIds));
    if (!nextLesson) {
        const routeStages = program.routesById[(current.routeId ?? 'R4')]?.primaryStageIds ?? [];
        const stageIdx = routeStages.indexOf(lesson.stageId);
        const nextStageId = stageIdx >= 0 ? routeStages[stageIdx + 1] : undefined;
        const nextStage = nextStageId ? program.stagesById[nextStageId] : undefined;
        nextLesson = nextStage ? nextStage.lessonIds.map((id) => program.lessonsById[id]).find(Boolean) : undefined;
    }
    const next = {
        ...current,
        stageId: nextLesson?.stageId ?? lesson.stageId,
        lessonId: nextLesson?.id ?? lesson.id,
        completedLessonIds,
        completedStageIds,
        unlockedLessonIds: unique([
            ...(current.unlockedLessonIds ?? []),
            ...(nextLesson ? [nextLesson.id] : []),
            ...(stage?.lessonIds.filter((id) => completedLessonIds.includes(id)) ?? []),
        ]),
    };
    await upsertJourneyV3Progress(next);
    return next;
}
function canUnlockLesson(lesson, completedLessonIds) {
    if (!lesson)
        return false;
    if (!lesson.prerequisites.length)
        return true;
    return lesson.prerequisites.every((id) => completedLessonIds.includes(id));
}
