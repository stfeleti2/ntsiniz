"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPhase1Pack = loadPhase1Pack;
exports.loadAllBundledPacks = loadAllBundledPacks;
const schema_1 = require("./schema");
const i18n_1 = require("@/core/i18n");
const loadWithManifest_1 = require("@/core/content/loadWithManifest");
const flags_1 = require("@/core/config/flags");
const errors_1 = require("@/core/util/errors");
function loadPhase1Pack() {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`drills/phase1.${locale}.json`) ??
        (0, loadWithManifest_1.tryLoadContentJson)("drills/phase1.en.json");
    const pack = (0, schema_1.validatePack)(raw);
    if ((0, flags_1.isPackDisabled)(pack.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: pack.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${pack.packId}`);
    }
    const drills = pack.drills.filter((d) => {
        const disabled = (0, flags_1.isDrillDisabled)(d.id);
        if (disabled)
            (0, errors_1.coreError)('drill_disabled', { drillId: d.id, packId: pack.packId });
        return !disabled;
    });
    return { ...pack, drills };
}
function loadPackById(baseId) {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`drills/${baseId}.${locale}.json`) ??
        (0, loadWithManifest_1.tryLoadContentJson)(`drills/${baseId}.en.json`);
    const pack = (0, schema_1.validatePack)(raw);
    if ((0, flags_1.isPackDisabled)(pack.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: pack.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${pack.packId}`);
    }
    const drills = pack.drills.filter((d) => {
        const disabled = (0, flags_1.isDrillDisabled)(d.id);
        if (disabled)
            (0, errors_1.coreError)('drill_disabled', { drillId: d.id, packId: pack.packId });
        return !disabled;
    });
    return { ...pack, drills };
}
/**
 * Loads all bundled packs and returns a merged pack (international-ready).
 * Why: content volume is a key moat and improves store conversion.
 */
function loadAllBundledPacks() {
    const packs = [
        loadPackById('phase1'),
        // New packs (safe fallback to en)
        loadPackById('warmups'),
        loadPackById('agility'),
        loadPackById('phase2'),
    ];
    const drills = packs.flatMap((p) => p.drills);
    return {
        packId: 'bundled_all',
        title: 'All Drills',
        version: 1,
        drills,
    };
}
