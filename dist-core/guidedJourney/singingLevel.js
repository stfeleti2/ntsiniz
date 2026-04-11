"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileForSingingLevel = profileForSingingLevel;
const LEVEL_MAP = {
    justStarting: {
        level: 'justStarting',
        coachingMode: 'starter',
        onboardingIntent: 'justStarting',
        helperDensity: 'high',
        guideTone: 'gentle',
        routeHint: 'R1',
    },
    casual: {
        level: 'casual',
        coachingMode: 'casual',
        onboardingIntent: 'justExplore',
        helperDensity: 'balanced',
        guideTone: 'balanced',
        routeHint: 'R3',
    },
    serious: {
        level: 'serious',
        coachingMode: 'practised',
        onboardingIntent: 'moreControl',
        helperDensity: 'balanced',
        guideTone: 'direct',
        routeHint: 'R2',
    },
    professionalCoach: {
        level: 'professionalCoach',
        coachingMode: 'performerCoach',
        onboardingIntent: 'songsBetter',
        helperDensity: 'light',
        guideTone: 'direct',
        routeHint: 'R5',
    },
};
function profileForSingingLevel(level) {
    return LEVEL_MAP[level];
}
