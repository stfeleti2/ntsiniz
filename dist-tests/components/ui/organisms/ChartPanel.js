"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartPanel = ChartPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Card_1 = require("@/components/ui/molecules/Card");
const Heading_1 = require("@/components/ui/atoms/Heading");
const TextBase_1 = require("@/components/ui/atoms/TextBase");
const provider_1 = require("@/theme/provider");
function normalize(points) {
    const max = Math.max(...points, 1);
    return points.map((point) => Math.max(0.08, point / max));
}
function ChartPanel({ points = [64, 68, 71, 73, 76, 79, 82] }) {
    const { colors, spacing, radius } = (0, provider_1.useTheme)();
    const normalized = normalize(points);
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: spacing[2] }, children: [(0, jsx_runtime_1.jsx)(Heading_1.Heading, { level: 3, children: "Performance Trend" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[1], minHeight: 92 }, children: normalized.map((value, index) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: {
                            flex: 1,
                            height: `${Math.round(value * 100)}%`,
                            minHeight: 14,
                            borderRadius: radius[1],
                            backgroundColor: index === normalized.length - 1 ? colors.primary : colors.secondary,
                            opacity: index === normalized.length - 1 ? 1 : 0.6,
                        } }, `${index}-${value}`))) }), (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { size: "sm", tone: "muted", children: "Last 7 attempts" })] }) }));
}
