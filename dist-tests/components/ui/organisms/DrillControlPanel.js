"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrillControlPanel = DrillControlPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Card_1 = require("@/components/ui/molecules/Card");
const Heading_1 = require("@/components/ui/atoms/Heading");
const BodyText_1 = require("@/components/ui/atoms/BodyText");
const Buttons_1 = require("@/components/ui/atoms/Buttons");
const provider_1 = require("@/theme/provider");
function DrillControlPanel({ title = 'Drill Controls', status = 'Ready to sing', onStart, onPause, }) {
    const { spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "elevated", children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: spacing[2] }, children: [(0, jsx_runtime_1.jsx)(Heading_1.Heading, { level: 3, children: title }), (0, jsx_runtime_1.jsx)(BodyText_1.BodyText, { tone: "muted", children: status }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(Buttons_1.PrimaryButton, { label: "Start", onPress: onStart }), (0, jsx_runtime_1.jsx)(Buttons_1.SecondaryButton, { label: "Pause", onPress: onPause })] })] }) }));
}
