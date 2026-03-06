"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrillBreakdown = DrillBreakdown;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const useTheme_1 = require("@/theme/useTheme");
const Typography_1 = require("@/ui/components/Typography");
const ui_1 = require("@/ui");
const i18n_1 = require("@/app/i18n");
function DrillBreakdown({ rows, maxRows = 5 }) {
    const theme = (0, useTheme_1.useTheme)();
    const top = (0, react_1.useMemo)(() => rows.slice(0, maxRows), [rows, maxRows]);
    const maxScore = Math.max(1, ...top.map((r) => r.avgScore));
    if (!top.length)
        return (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('drillBreakdown.empty') });
    return ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: { gap: 10 }, children: top.map((r) => {
            const w = Math.max(0.08, r.avgScore / maxScore);
            const deltaText = r.delta == null ? "" : ` ${r.delta > 0 ? "+" : ""}${r.delta}`;
            return ((0, jsx_runtime_1.jsxs)(ui_1.Box, { style: { gap: 6 }, children: [(0, jsx_runtime_1.jsxs)(ui_1.Box, { style: styles.rowHeader, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h2", style: { flex: 1 }, children: r.label }), (0, jsx_runtime_1.jsxs)(Typography_1.Text, { preset: "muted", children: [r.avgScore, deltaText] })] }), (0, jsx_runtime_1.jsx)(ui_1.Box, { style: [styles.track, { backgroundColor: theme.colors.line }], children: (0, jsx_runtime_1.jsx)(ui_1.Box, { style: {
                                width: `${Math.round(w * 100)}%`,
                                height: 10,
                                borderRadius: 999,
                                backgroundColor: theme.colors.accent,
                            } }) }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('drillBreakdown.attempts', { count: r.attempts }) })] }, r.label));
        }) }));
}
const styles = react_native_1.StyleSheet.create({
    rowHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
    track: { height: 10, borderRadius: 999, overflow: "hidden" },
});
