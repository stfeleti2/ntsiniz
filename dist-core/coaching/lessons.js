"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPhase1Lessons = loadPhase1Lessons;
exports.loadMarketplaceLessons = loadMarketplaceLessons;
exports.loadAllLessons = loadAllLessons;
exports.findLesson = findLesson;
exports.loadProRegimenLessons = loadProRegimenLessons;
exports.loadProRegimen12Lessons = loadProRegimen12Lessons;
const i18n_1 = require("@/core/i18n");
const loadWithManifest_1 = require("@/core/content/loadWithManifest");
const flags_1 = require("@/core/config/flags");
const errors_1 = require("@/core/util/errors");
function parseMeta(raw) {
    if (!raw || typeof raw !== 'object')
        return undefined;
    const week = typeof raw.week === 'number' ? raw.week : undefined;
    const day = typeof raw.day === 'number' ? raw.day : undefined;
    const focus = typeof raw.focus === 'string' ? raw.focus : undefined;
    const difficulty = typeof raw.difficulty === 'string' ? raw.difficulty : undefined;
    const durationMin = typeof raw.durationMin === 'number' ? raw.durationMin : undefined;
    const fp = raw.feedbackPlan && typeof raw.feedbackPlan === 'object' ? raw.feedbackPlan : undefined;
    const feedbackPlan = fp && typeof fp.mode === 'string' && typeof fp.bandwidthCents === 'number'
        ? {
            mode: fp.mode,
            bandwidthCents: fp.bandwidthCents,
            fadeAfterSec: typeof fp.fadeAfterSec === 'number' ? fp.fadeAfterSec : undefined,
        }
        : undefined;
    const drillIds = Array.isArray(raw.drillIds) ? raw.drillIds.filter((x) => typeof x === 'string') : undefined;
    return { week, day, focus, difficulty, durationMin, feedbackPlan, drillIds };
}
function loadPhase1Lessons() {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`lessons/phase1.${locale}.json`) ??
        (0, loadWithManifest_1.tryLoadContentJson)('lessons/phase1.en.json');
    if (!raw || typeof raw !== 'object')
        throw new Error('Invalid lesson pack');
    if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
        throw new Error('Invalid lesson pack');
    }
    if ((0, flags_1.isPackDisabled)(raw.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: raw.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${raw.packId}`);
    }
    return {
        packId: raw.packId,
        language: raw.language,
        lessons: raw.lessons
            .filter((l) => l && typeof l.id === 'string' && typeof l.title === 'string')
            .filter((l) => {
            const id = String(l.id);
            if (!id)
                return false;
            if ((0, flags_1.isLessonDisabled)(id)) {
                (0, errors_1.coreError)('lesson_disabled', { lessonId: id });
                return __DEV__;
            }
            return true;
        })
            .map((l) => ({
            id: l.id,
            title: l.title,
            body: typeof l.body === 'string' ? l.body : '',
            keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x) => typeof x === 'string') : undefined,
            doThis: Array.isArray(l.doThis) ? l.doThis.filter((x) => typeof x === 'string') : undefined,
            avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x) => typeof x === 'string') : undefined,
            coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x) => typeof x === 'string') : undefined,
            demo: Array.isArray(l.demo)
                ? l.demo
                    .filter((x) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
                    .map((x) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
                : undefined,
            meta: parseMeta(l.meta),
        })),
    };
}
function loadMarketplaceLessons() {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`lessons/marketplace.${locale}.json`) ??
        (0, loadWithManifest_1.tryLoadContentJson)('lessons/marketplace.en.json');
    if (!raw || typeof raw !== 'object')
        throw new Error('Invalid lesson pack');
    if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
        throw new Error('Invalid lesson pack');
    }
    if ((0, flags_1.isPackDisabled)(raw.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: raw.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${raw.packId}`);
    }
    return {
        packId: raw.packId,
        language: raw.language,
        lessons: raw.lessons
            .filter((l) => l && typeof l.id === 'string' && typeof l.title === 'string')
            .filter((l) => {
            const id = String(l.id);
            if (!id)
                return false;
            if ((0, flags_1.isLessonDisabled)(id)) {
                (0, errors_1.coreError)('lesson_disabled', { lessonId: id });
                return __DEV__;
            }
            return true;
        })
            .map((l) => ({
            id: l.id,
            title: l.title,
            body: typeof l.body === 'string' ? l.body : '',
            keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x) => typeof x === 'string') : undefined,
            doThis: Array.isArray(l.doThis) ? l.doThis.filter((x) => typeof x === 'string') : undefined,
            avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x) => typeof x === 'string') : undefined,
            coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x) => typeof x === 'string') : undefined,
            demo: Array.isArray(l.demo)
                ? l.demo
                    .filter((x) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
                    .map((x) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
                : undefined,
            meta: parseMeta(l.meta),
        })),
    };
}
function loadAllLessons() {
    const phase1 = loadPhase1Lessons();
    const marketplace = loadMarketplaceLessons();
    return {
        packId: `${phase1.packId}+${marketplace.packId}`,
        language: phase1.language,
        lessons: [...phase1.lessons, ...marketplace.lessons],
    };
}
function findLesson(pack, lessonId) {
    if (!lessonId)
        return null;
    return pack.lessons.find((l) => l.id === lessonId) ?? null;
}
function loadProRegimenLessons() {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`lessons/pro_regimen.${locale}.json`) ??
        (0, loadWithManifest_1.tryLoadContentJson)('lessons/pro_regimen.en.json');
    if (!raw || typeof raw !== 'object')
        throw new Error('Invalid lesson pack');
    if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
        throw new Error('Invalid lesson pack');
    }
    if ((0, flags_1.isPackDisabled)(raw.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: raw.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${raw.packId}`);
    }
    return {
        packId: raw.packId,
        language: raw.language,
        lessons: raw.lessons
            .filter((l) => l && typeof l.id === 'string' && typeof l.title === 'string')
            .filter((l) => {
            const id = String(l.id);
            if (!id)
                return false;
            if ((0, flags_1.isLessonDisabled)(id)) {
                (0, errors_1.coreError)('lesson_disabled', { lessonId: id });
                return __DEV__;
            }
            return true;
        })
            .map((l) => ({
            id: l.id,
            title: l.title,
            body: typeof l.body === 'string' ? l.body : '',
            keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x) => typeof x === 'string') : undefined,
            doThis: Array.isArray(l.doThis) ? l.doThis.filter((x) => typeof x === 'string') : undefined,
            avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x) => typeof x === 'string') : undefined,
            coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x) => typeof x === 'string') : undefined,
            demo: Array.isArray(l.demo)
                ? l.demo
                    .filter((x) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
                    .map((x) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
                : undefined,
            meta: parseMeta(l.meta),
        })),
    };
}
function loadProRegimen12Lessons(track) {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const base = `lessons/pro_regimen12_${track}`;
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`${base}.${locale}.json`) ?? (0, loadWithManifest_1.tryLoadContentJson)(`${base}.en.json`);
    if (!raw || typeof raw !== 'object')
        throw new Error('Invalid lesson pack');
    if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
        throw new Error('Invalid lesson pack');
    }
    if ((0, flags_1.isPackDisabled)(raw.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: raw.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${raw.packId}`);
    }
    return {
        packId: raw.packId,
        language: raw.language,
        lessons: raw.lessons
            .filter((l) => l && typeof l.id === 'string' && typeof l.title === 'string')
            .filter((l) => {
            const id = String(l.id);
            if (!id)
                return false;
            if ((0, flags_1.isLessonDisabled)(id)) {
                (0, errors_1.coreError)('lesson_disabled', { lessonId: id });
                return __DEV__;
            }
            return true;
        })
            .map((l) => ({
            id: l.id,
            title: l.title,
            body: typeof l.body === 'string' ? l.body : '',
            keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x) => typeof x === 'string') : undefined,
            doThis: Array.isArray(l.doThis) ? l.doThis.filter((x) => typeof x === 'string') : undefined,
            avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x) => typeof x === 'string') : undefined,
            coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x) => typeof x === 'string') : undefined,
            demo: Array.isArray(l.demo)
                ? l.demo
                    .filter((x) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
                    .map((x) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
                : undefined,
            meta: parseMeta(l.meta),
        })),
    };
}
