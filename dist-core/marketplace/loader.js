"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMarketplaceCoaches = loadMarketplaceCoaches;
exports.loadMarketplacePrograms = loadMarketplacePrograms;
const i18n_1 = require("@/core/i18n");
let _contentGetter = null;
function getBundledContentJson(filePath) {
    if (!_contentGetter) {
        // Keep this as runtime require so core-only build does not pull src/content into rootDir.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('@/content/contentIndex');
        _contentGetter = mod.getBundledContentJson;
    }
    return _contentGetter(filePath);
}
function loadMarketplaceCoaches(localeOverride) {
    const locale = (localeOverride ?? (0, i18n_1.getLocale)() ?? 'en').split('-')[0];
    const raw = getBundledContentJson(`marketplace/coaches.${locale}.json`) ?? getBundledContentJson('marketplace/coaches.en.json');
    if (!raw || typeof raw !== 'object' || typeof raw.packId !== 'string' || !Array.isArray(raw.coaches))
        throw new Error('Invalid coaches pack');
    const pack = raw;
    // Featured first.
    pack.coaches = [...pack.coaches].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return pack;
}
function loadMarketplacePrograms(localeOverride) {
    const locale = (localeOverride ?? (0, i18n_1.getLocale)() ?? 'en').split('-')[0];
    const raw = getBundledContentJson(`marketplace/programs.${locale}.json`) ?? getBundledContentJson('marketplace/programs.en.json');
    if (!raw || typeof raw !== 'object' || typeof raw.packId !== 'string' || !Array.isArray(raw.programs))
        throw new Error('Invalid programs pack');
    const pack = raw;
    // Normalize access fields (backward-compatible) + featured first.
    pack.programs = [...pack.programs]
        .map((p) => ({ ...p, access: p.access === 'pro' ? 'pro' : 'free', priceLabel: typeof p.priceLabel === 'string' ? p.priceLabel : undefined }))
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return pack;
}
