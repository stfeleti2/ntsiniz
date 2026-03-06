"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCompetitionsPack = loadCompetitionsPack;
const i18n_1 = require("@/core/i18n");
const loadWithManifest_1 = require("@/core/content/loadWithManifest");
const flags_1 = require("@/core/config/flags");
const errors_1 = require("@/core/util/errors");
function loadCompetitionsPack() {
    const locale = ((0, i18n_1.getLocale)() || 'en').split('-')[0];
    const raw = (0, loadWithManifest_1.tryLoadContentJson)(`competitions/phase1.${locale}.json`) ??
        (0, loadWithManifest_1.tryLoadContentJson)('competitions/phase1.en.json');
    const pack = raw;
    if (!pack?.packId) {
        (0, errors_1.coreError)('competitions_pack_invalid', { locale });
        if (!__DEV__)
            throw new Error('Invalid competitions pack');
        return pack;
    }
    if ((0, flags_1.isPackDisabled)(pack.packId)) {
        (0, errors_1.coreError)('pack_disabled', { packId: pack.packId });
        if (!__DEV__)
            throw new Error(`Pack disabled: ${pack.packId}`);
    }
    // Rollback semantics: allow remote kill-switch of specific competitions.
    if (Array.isArray(pack.seasons)) {
        pack.seasons = pack.seasons
            .map((s) => ({
            ...s,
            competitions: Array.isArray(s.competitions)
                ? s.competitions.filter((c) => {
                    const id = String(c?.id ?? '');
                    if (!id)
                        return false;
                    if ((0, flags_1.isCompetitionDisabled)(id)) {
                        (0, errors_1.coreError)('competition_disabled', { competitionId: id });
                        return __DEV__;
                    }
                    return true;
                })
                : [],
        }))
            .filter((s) => (s.competitions?.length ?? 0) > 0);
    }
    return pack;
}
