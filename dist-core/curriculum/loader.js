"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPhase1Curriculum = loadPhase1Curriculum;
exports.loadProRegimenCurriculum = loadProRegimenCurriculum;
exports.loadProRegimen12Curriculum = loadProRegimen12Curriculum;
exports.loadCurriculum = loadCurriculum;
const schema_1 = require("./schema");
const i18n_1 = require("@/core/i18n");
const loadWithManifest_1 = require("@/core/content/loadWithManifest");
const flags_1 = require("@/core/config/flags");
const errors_1 = require("@/core/util/errors");
function loadPack(pathBase) {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`${pathBase}.${locale}.json`) ??
        (0, loadWithManifest_1.tryLoadContentJson)(`${pathBase}.en.json`);
    const pack = (0, schema_1.validateCurriculumPack)(raw);
    if ((0, flags_1.isPackDisabled)(pack.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: pack.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${pack.packId}`);
    }
    const curriculum = {
        ...pack.curriculum,
        days: pack.curriculum.days.map((d) => {
            const drillIds = d.drillIds.filter((id) => {
                const disabled = (0, flags_1.isDrillDisabled)(id);
                if (disabled)
                    (0, errors_1.coreError)('curriculum_drill_disabled', { drillId: id, dayId: d.id, packId: pack.packId });
                return !disabled;
            });
            return { ...d, drillIds };
        }),
    };
    return { ...pack, curriculum };
}
function loadPhase1Curriculum() {
    return loadPack('curriculum/phase1').curriculum;
}
function loadProRegimenCurriculum() {
    return loadPack('curriculum/pro_regimen').curriculum;
}
function loadProRegimen12Curriculum(track) {
    return loadPack(`curriculum/pro_regimen12_${track}`).curriculum;
}
function loadCurriculum(id, track = 'beginner') {
    switch (id) {
        case 'pro_regimen':
            return loadProRegimenCurriculum();
        case 'pro_regimen12':
            return loadProRegimen12Curriculum(track);
        case 'phase1':
        default:
            return loadPhase1Curriculum();
    }
}
