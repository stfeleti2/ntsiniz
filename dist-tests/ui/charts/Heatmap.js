"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heatmap = Heatmap;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const useTheme_1 = require("@/theme/useTheme");
const Typography_1 = require("@/ui/components/Typography");
const ui_1 = require("@/ui");
const i18n_1 = require("@/app/i18n");
function withAlpha(hex, alpha01) {
    const a = Math.max(0, Math.min(1, alpha01));
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function startOfDayMs(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function Heatmap({ days, columns = 7 }) {
    const theme = (0, useTheme_1.useTheme)();
    const { maxSignal, cells } = (0, react_1.useMemo)(() => {
        const max = Math.max(1, ...days.map((d) => d.sessions * 2 + Math.min(60, d.minutes) / 10));
        const list = days.map((d) => {
            const signal = d.sessions * 2 + Math.min(60, d.minutes) / 10;
            return { ...d, signal };
        });
        return { maxSignal: max, cells: list };
    }, [days]);
    // pad to full rows for stable layout
    const padded = (0, react_1.useMemo)(() => {
        const total = Math.ceil(cells.length / columns) * columns;
        const pad = total - cells.length;
        if (pad <= 0)
            return cells;
        const first = cells[0];
        const start = first ? startOfDayMs(first.dayMs) : startOfDayMs(Date.now());
        const empty = Array.from({ length: pad }, (_, i) => ({ dayMs: start - (pad - i) * 86400000, sessions: 0, minutes: 0, signal: 0 }));
        return [...empty, ...cells];
    }, [cells, columns]);
    const rows = Math.ceil(padded.length / columns);
    const weekday = (ts) => new Date(ts).getDay(); // 0 Sun
    const isStartOfWeek = (ts) => weekday(ts) === 1; // Monday
    return ((0, jsx_runtime_1.jsxs)(ui_1.Box, { style: styles.wrap, children: [(0, jsx_runtime_1.jsxs)(ui_1.Box, { style: styles.legendRow, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('heatmap.less') }), (0, jsx_runtime_1.jsx)(ui_1.Box, { style: { flexDirection: "row", gap: 6, alignItems: "center" }, children: [0.15, 0.35, 0.6, 0.9].map((a, idx) => ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: {
                                width: 12,
                                height: 12,
                                borderRadius: 4,
                                backgroundColor: withAlpha(theme.colors.accent, a),
                                borderWidth: 1,
                                borderColor: theme.colors.line,
                            } }, `${a}-${idx}`))) }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('heatmap.more') })] }), (0, jsx_runtime_1.jsx)(ui_1.Box, { style: [styles.grid, { borderColor: theme.colors.line, backgroundColor: theme.colors.bg }], children: Array.from({ length: rows }).map((_, r) => ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: styles.row, children: Array.from({ length: columns }).map((__, c) => {
                        const idx = r * columns + c;
                        const cell = padded[idx];
                        const alpha = cell.signal <= 0 ? 0.08 : 0.1 + 0.9 * (cell.signal / maxSignal);
                        const monthMarker = isStartOfWeek(cell.dayMs);
                        return ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: {
                                width: 12,
                                height: 12,
                                borderRadius: 4,
                                backgroundColor: withAlpha(theme.colors.accent, alpha),
                                borderWidth: 1,
                                borderColor: monthMarker ? theme.colors.warn : theme.colors.line,
                            } }, idx));
                    }) }, r))) })] }));
}
const styles = react_native_1.StyleSheet.create({
    wrap: { gap: 10 },
    legendRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    grid: {
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        gap: 6,
    },
    row: { flexDirection: "row", gap: 6 },
});
