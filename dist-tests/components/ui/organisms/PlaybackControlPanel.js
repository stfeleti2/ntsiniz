"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackControlPanel = PlaybackControlPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Card_1 = require("@/components/ui/molecules/Card");
const Heading_1 = require("@/components/ui/atoms/Heading");
const BodyText_1 = require("@/components/ui/atoms/BodyText");
const Buttons_1 = require("@/components/ui/atoms/Buttons");
const provider_1 = require("@/theme/provider");
function PlaybackControlPanel({ elapsed = '00:14 / 00:56', onPlay, onRestart, }) {
    const { spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: spacing[2] }, children: [(0, jsx_runtime_1.jsx)(Heading_1.Heading, { level: 3, children: "Playback" }), (0, jsx_runtime_1.jsx)(BodyText_1.BodyText, { tone: "muted", children: elapsed }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(Buttons_1.PrimaryButton, { label: "Play / Pause", onPress: onPlay }), (0, jsx_runtime_1.jsx)(Buttons_1.GhostButton, { label: "Restart", onPress: onRestart })] })] }) }));
}
