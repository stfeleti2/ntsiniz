"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnabledStackScreenNames = getEnabledStackScreenNames;
const CORE_STACK_SCREENS = [
    'Welcome',
    'Calibration',
    'Onboarding',
    'MainTabs',
    'Tuner',
    'MicTest',
    'Drill',
    'DrillResult',
    'Results',
    'Playback',
    'RecoveredTakes',
    'CurriculumOverview',
    'CurriculumDayPreview',
    'DayComplete',
    'Billing',
    'Privacy',
    'Paywall',
    'SessionSummary',
    'WeeklyReport',
    'PitchLockChallenge',
];
function getEnabledStackScreenNames(flags) {
    const names = [...CORE_STACK_SCREENS];
    if (flags.dev) {
        names.push('Billing', 'PermissionsPrimer', 'Privacy');
    }
    if (!flags.storeBuild) {
        names.push('Missions', 'AdminContent');
    }
    if (flags.socialOn) {
        names.push('ChallengesHub', 'Leaderboard', 'Friends', 'ImportCode', 'CreatePost', 'PostDetail', 'Account', 'SignIn', 'CreatorProfile');
    }
    if (flags.invitesOn)
        names.push('Invite');
    if (flags.cloudOn)
        names.push('SyncStatus');
    if (flags.duetsOn) {
        names.push('DuetsHub', 'DuetCreate', 'DuetImport', 'DuetSession');
    }
    if (flags.competitionsOn) {
        names.push('CompetitionsHub', 'CompetitionDetail', 'CompetitionSubmit', 'CompetitionLeaderboard');
    }
    if (flags.marketplaceOn) {
        names.push('Marketplace', 'ProgramDetail', 'ProgramDayComplete', 'FeedbackInbox', 'FeedbackDetail', 'FeedbackImport', 'CoachTools');
    }
    return names;
}
