"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyHeaderModule = JourneyHeaderModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const Card_1 = require("@/ui/components/kit/Card");
const Button_1 = require("@/ui/components/kit/Button");
const primitives_1 = require("@/ui/primitives");
function JourneyHeaderModule({ tab, onTab, onOpenLab, testID, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { testID: testID, children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 10, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "xl", weight: "bold", children: (0, i18n_1.t)('journey.title') }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: (0, i18n_1.t)('journey.subtitle') }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 10, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('journey.tabs.map'), variant: tab === 'map' ? 'primary' : 'secondary', onPress: () => onTab('map'), testID: testID ? `${testID}.map` : undefined }), (0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('journey.tabs.proof'), variant: tab === 'proof' ? 'primary' : 'secondary', onPress: () => onTab('proof'), testID: testID ? `${testID}.proof` : undefined })] }), __DEV__ && onOpenLab ? ((0, jsx_runtime_1.jsx)(Button_1.Button, { label: (0, i18n_1.t)('dev.openComponentLab'), variant: "ghost", onPress: onOpenLab })) : null] }) }));
}
