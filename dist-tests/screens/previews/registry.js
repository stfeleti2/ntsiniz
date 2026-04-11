"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderedScreenPreviews = exports.screenPreviewRegistry = void 0;
const WelcomePreview_1 = require("./WelcomePreview");
const SingingLevelSelectionPreview_1 = require("./SingingLevelSelectionPreview");
const MicPermissionPreview_1 = require("./MicPermissionPreview");
const RangeFinderPreview_1 = require("./RangeFinderPreview");
const DrillPreview_1 = require("./DrillPreview");
const PlaybackPreview_1 = require("./PlaybackPreview");
const SessionSummaryPreview_1 = require("./SessionSummaryPreview");
exports.screenPreviewRegistry = {
    welcome: {
        id: 'welcome',
        title: 'Welcome / Splash',
        description: 'First impression and start CTA.',
        component: WelcomePreview_1.WelcomePreview,
    },
    'singing-level': {
        id: 'singing-level',
        title: 'Singing Level Selection',
        description: 'User profile calibration step.',
        component: SingingLevelSelectionPreview_1.SingingLevelSelectionPreview,
    },
    'mic-permission': {
        id: 'mic-permission',
        title: 'Mic Permission',
        description: 'Permission rationale and next actions.',
        component: MicPermissionPreview_1.MicPermissionPreview,
    },
    'range-finder': {
        id: 'range-finder',
        title: 'Range Finder',
        description: 'Range calibration before drills.',
        component: RangeFinderPreview_1.RangeFinderPreview,
    },
    drill: {
        id: 'drill',
        title: 'Singing Drill',
        description: 'Live drill controls and state.',
        component: DrillPreview_1.DrillPreview,
    },
    playback: {
        id: 'playback',
        title: 'Playback',
        description: 'Playback controls and waveform context.',
        component: PlaybackPreview_1.PlaybackPreview,
    },
    'session-summary': {
        id: 'session-summary',
        title: 'Session Summary / Win',
        description: 'Post-session outcome and encouragement.',
        component: SessionSummaryPreview_1.SessionSummaryPreview,
    },
};
exports.orderedScreenPreviews = Object.values(exports.screenPreviewRegistry);
