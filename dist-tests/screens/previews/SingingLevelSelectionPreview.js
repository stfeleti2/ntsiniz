"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingingLevelSelectionPreview = SingingLevelSelectionPreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const molecules_1 = require("@/components/ui/molecules");
const atoms_1 = require("@/components/ui/atoms");
const provider_1 = require("@/theme/provider");
const levels = ['Just starting', 'Casual', 'Serious', 'Professional / Coach'];
function SingingLevelSelectionPreview() {
    const { spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsxs)(molecules_1.Container, { children: [(0, jsx_runtime_1.jsx)(atoms_1.Heading, { level: 2, children: "Select your singing level" }), (0, jsx_runtime_1.jsx)(atoms_1.BodyText, { tone: "muted", children: "This tunes helper density for your first drill." }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { gap: spacing[2] }, children: levels.map((level, idx) => ((0, jsx_runtime_1.jsx)(molecules_1.Card, { tone: idx === 1 ? 'glow' : 'default', children: (0, jsx_runtime_1.jsx)(atoms_1.BodyText, { children: level }) }, level))) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(atoms_1.PrimaryButton, { label: "Continue" }), (0, jsx_runtime_1.jsx)(atoms_1.SecondaryButton, { label: "Back" })] })] }));
}
