"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyNextUpMissionModule = JourneyNextUpMissionModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const primitives_1 = require("@/ui/primitives");
const kit_1 = require("@/ui/components/kit");
/**
 * UI-only block for the "Next Up" mission content.
 * No business logic here; just props + callbacks.
 */
function JourneyNextUpMissionModule({ mission, onStartMission, testID }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 6 }, testID: testID, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "md", weight: "bold", children: mission.title }), mission.subtitle ? ((0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: mission.subtitle })) : null, (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { marginTop: 10 }, children: (0, jsx_runtime_1.jsx)(kit_1.Button, { label: (0, i18n_1.t)('journey.startMission'), onPress: () => onStartMission?.(mission), testID: testID ? `${testID}.start` : undefined }) })] }));
}
