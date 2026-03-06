"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCurriculum = validateCurriculum;
exports.validateCurriculumPack = validateCurriculumPack;
function validateCurriculum(raw) {
    if (!raw || typeof raw !== 'object')
        throw new Error('Invalid curriculum');
    if (typeof raw.curriculumId !== 'string' || typeof raw.language !== 'string' || typeof raw.title !== 'string') {
        throw new Error('Invalid curriculum');
    }
    if (!Array.isArray(raw.days))
        throw new Error('Invalid curriculum days');
    const days = raw.days.map((d) => {
        if (!d || typeof d !== 'object')
            throw new Error('Invalid curriculum day');
        if (typeof d.id !== 'string' || typeof d.title !== 'string')
            throw new Error('Invalid curriculum day');
        if (!Array.isArray(d.drillIds))
            throw new Error('Invalid curriculum day drills');
        return {
            id: d.id,
            title: d.title,
            week: typeof d.week === 'number' ? d.week : 1,
            day: typeof d.day === 'number' ? d.day : 1,
            focus: typeof d.focus === 'string' ? d.focus : '',
            lessonId: typeof d.lessonId === 'string' ? d.lessonId : undefined,
            drillIds: d.drillIds.filter((x) => typeof x === 'string'),
        };
    });
    return {
        curriculumId: raw.curriculumId,
        language: raw.language,
        title: raw.title,
        days,
    };
}
function validateCurriculumPack(raw) {
    if (!raw || typeof raw !== 'object')
        throw new Error('Invalid curriculum pack');
    if (typeof raw.packId !== 'string' || typeof raw.language !== 'string')
        throw new Error('Invalid curriculum pack');
    const curriculum = validateCurriculum(raw.curriculum);
    return { packId: raw.packId, language: raw.language, curriculum };
}
