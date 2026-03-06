"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyNextUpModule = JourneyNextUpModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const i18n_1 = require("@/app/i18n");
const primitives_1 = require("@/ui/primitives");
const kit_1 = require("@/ui/components/kit");
const useTheme_1 = require("@/theme/useTheme");
const JourneyNextUpMissionModule_1 = require("./JourneyNextUpMissionModule");
function JourneyNextUpModule({ progress, mission, onStartMission, testID }) {
    return ((0, jsx_runtime_1.jsxs)(kit_1.Card, { testID: testID, style: {
            borderWidth: 1,
            borderColor: 'rgba(255, 61, 206, 0.28)',
        }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: (0, i18n_1.t)('journey.nextUpTitle') }), (0, jsx_runtime_1.jsx)(ProgressRow, { done: progress.done, total: progress.total, pct: progress.pct }), !mission ? ((0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: (0, i18n_1.t)('journey.unlockMap') })) : ((0, jsx_runtime_1.jsx)(JourneyNextUpMissionModule_1.JourneyNextUpMissionModule, { mission: mission, onStartMission: onStartMission, testID: testID ? `${testID}.mission` : undefined }))] }));
}
function ProgressRow({ done, total, pct }) {
    const theme = (0, useTheme_1.useTheme)();
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 6, marginTop: 6 }, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: (0, i18n_1.t)('journey.phase1') }), (0, jsx_runtime_1.jsxs)(primitives_1.Text, { tone: "muted", size: "sm", weight: "bold", children: [done, "/", total] })] }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    overflow: 'hidden',
                }, children: (0, jsx_runtime_1.jsx)(expo_linear_gradient_1.LinearGradient, { colors: theme.gradients.primary, start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, style: { height: 10, width: `${Math.max(6, Math.round(pct * 100))}%` } }) })] }));
}
