"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const surfacePolicy_1 = require("@/app/navigation/surfacePolicy");
function names(flags) {
    return new Set((0, surfacePolicy_1.getEnabledStackScreenNames)(flags));
}
(0, node_test_1.default)('store build does not expose Phase 3 / social / cloud surfaces', () => {
    const set = names({
        storeBuild: true,
        cloudOn: false,
        socialOn: false,
        invitesOn: false,
        duetsOn: false,
        competitionsOn: false,
        marketplaceOn: false,
        diagnosticsOn: false,
        dev: false,
    });
    const forbidden = [
        'ChallengesHub',
        'Leaderboard',
        'Friends',
        'ImportCode',
        'CreatePost',
        'PostDetail',
        'Invite',
        'CreatorProfile',
        'Account',
        'SignIn',
        'SyncStatus',
        'DuetsHub',
        'DuetCreate',
        'DuetImport',
        'DuetSession',
        'CompetitionsHub',
        'CompetitionDetail',
        'CompetitionSubmit',
        'CompetitionLeaderboard',
        'Marketplace',
        'CoachTools',
        'ModTools',
    ];
    for (const f of forbidden) {
        strict_1.default.equal(set.has(f), false, `forbidden screen leaked into store build: ${f}`);
    }
    // Core surfaces must remain.
    for (const required of ['Welcome', 'PermissionsPrimer', 'WakeYourVoice', 'FirstWinResult', 'Recovery', 'MainTabs', 'Drill', 'DrillResult']) {
        strict_1.default.equal(set.has(required), true, `required screen missing: ${required}`);
    }
});
(0, node_test_1.default)('non-store build with social+cloud+invites enables expected surfaces', () => {
    const set = names({
        storeBuild: false,
        cloudOn: true,
        socialOn: true,
        invitesOn: true,
        duetsOn: false,
        competitionsOn: false,
        marketplaceOn: false,
        diagnosticsOn: false,
        dev: false,
    });
    for (const expected of ['ImportCode', 'Invite', 'CreatorProfile', 'Account', 'SignIn', 'SyncStatus']) {
        strict_1.default.equal(set.has(expected), true, `expected screen missing: ${expected}`);
    }
});
