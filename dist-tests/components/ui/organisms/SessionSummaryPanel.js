"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSummaryPanel = SessionSummaryPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Card_1 = require("@/components/ui/molecules/Card");
const Heading_1 = require("@/components/ui/atoms/Heading");
const BodyText_1 = require("@/components/ui/atoms/BodyText");
const StatusBanner_1 = require("@/components/ui/molecules/StatusBanner");
const provider_1 = require("@/theme/provider");
function SessionSummaryPanel({ score = 82 }) {
    const { spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { tone: "glow", children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: spacing[2] }, children: [(0, jsx_runtime_1.jsx)(Heading_1.Heading, { level: 2, children: "Session Summary" }), (0, jsx_runtime_1.jsxs)(BodyText_1.BodyText, { tone: "muted", children: ["Latest score: ", score] }), (0, jsx_runtime_1.jsx)(StatusBanner_1.StatusBanner, { title: score >= 80 ? 'Great win' : 'Keep pushing', body: score >= 80 ? 'You held pitch with strong consistency.' : 'Focus on steadier breath support on long notes.', tone: score >= 80 ? 'success' : 'warning' })] }) }));
}
