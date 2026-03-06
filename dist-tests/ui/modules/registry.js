"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevModuleRegistry = getDevModuleRegistry;
const i18n_1 = require("@/app/i18n");
function getDevModuleRegistry() {
    return [
        {
            key: 'module.home.hero',
            title: (0, i18n_1.t)('dev.modulesRegistry.homeHeroTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.homeHeroDesc'),
        },
        {
            key: 'module.home.recommended',
            title: (0, i18n_1.t)('dev.modulesRegistry.homeRecommendedTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.homeRecommendedDesc'),
        },
        {
            key: 'module.journey.header',
            title: (0, i18n_1.t)('dev.modulesRegistry.journeyHeaderTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.journeyHeaderDesc'),
        },
        {
            key: 'module.journey.nextUp',
            title: (0, i18n_1.t)('dev.modulesRegistry.journeyNextUpTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.journeyNextUpDesc'),
        },
        {
            key: 'module.journey.sessionRow',
            title: (0, i18n_1.t)('dev.modulesRegistry.journeySessionRowTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.journeySessionRowDesc'),
        },
        {
            key: 'module.session.summary',
            title: (0, i18n_1.t)('dev.modulesRegistry.sessionSummaryTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.sessionSummaryDesc'),
        },
        {
            key: 'module.results.score',
            title: (0, i18n_1.t)('dev.modulesRegistry.resultsScoreTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.resultsScoreDesc'),
        },
        {
            key: 'module.results.share',
            title: (0, i18n_1.t)('dev.modulesRegistry.resultsShareTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.resultsShareDesc'),
        },
        {
            key: 'pattern.playbackOverlay.live',
            title: (0, i18n_1.t)('dev.modulesRegistry.playbackLiveTitle'),
            description: (0, i18n_1.t)('dev.modulesRegistry.playbackLiveDesc'),
        },
    ];
}
