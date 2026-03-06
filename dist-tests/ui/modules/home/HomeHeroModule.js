"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeHeroModule = HomeHeroModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const Card_1 = require("@/ui/components/kit/Card");
const Button_1 = require("@/ui/components/kit/Button");
const Badge_1 = require("@/ui/components/kit/Badge");
const primitives_1 = require("@/ui/primitives");
function HomeHeroModule({ stats, onStartSession, onOpenTuner, testID, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { testID: testID, children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 10, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: (0, i18n_1.t)('home.vibeTitle') }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: (0, i18n_1.t)('home.todaySubtitle') })] }), (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(Badge_1.Badge, { label: (0, i18n_1.t)('home.pill.streakDay', { days: stats.streakDays }) }), (0, jsx_runtime_1.jsx)(Badge_1.Badge, { label: (0, i18n_1.t)('home.pill.lastScore', { value: stats.lastScore }), tone: "success" }), (0, jsx_runtime_1.jsx)(Badge_1.Badge, { label: (0, i18n_1.t)('home.pill.last7Avg', { value: stats.last7Avg }), tone: "warning" }), (0, jsx_runtime_1.jsx)(Badge_1.Badge, { label: (0, i18n_1.t)('home.pill.bestScore', { value: stats.bestScore }) })] }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 10, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('home.startDailySession'), onPress: onStartSession, testID: testID ? `${testID}.start` : undefined }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('home.openTuner'), variant: "secondary", onPress: onOpenTuner, testID: testID ? `${testID}.tuner` : undefined })] })] }) }));
}
