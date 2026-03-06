"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeRecommendedModule = HomeRecommendedModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const Card_1 = require("@/ui/components/kit/Card");
const Button_1 = require("@/ui/components/kit/Button");
const primitives_1 = require("@/ui/primitives");
function HomeRecommendedModule({ mission, onStartMission, onOpenJourney, testID, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { testID: testID, children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 10, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "lg", weight: "bold", children: (0, i18n_1.t)('home.nextMissionTitle') }), !mission ? ((0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: (0, i18n_1.t)('home.unlockJourney') })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: mission.title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: mission.subtitle }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('home.startMission'), onPress: () => onStartMission(mission), testID: testID ? `${testID}.start` : undefined }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('home.seeFullMap'), variant: "ghost", onPress: onOpenJourney, testID: testID ? `${testID}.journey` : undefined })] }))] }) }));
}
