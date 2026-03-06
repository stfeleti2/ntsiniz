"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const Typography_1 = require("@/ui/components/Typography");
const useTheme_1 = require("@/theme/useTheme");
const primitives_1 = require("@/ui/primitives");
const i18n_1 = require("@/core/i18n");
exports.ProgressCard = react_1.default.forwardRef(function ProgressCard({ stats }, ref) {
    const theme = (0, useTheme_1.useTheme)();
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { ref: ref, style: [
            styles.card,
            {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.line,
            },
        ], children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h2", children: (0, i18n_1.t)('progressCard.title') }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: stats.label }), (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: styles.row, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: styles.block, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('progressCard.score') }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h1", children: stats.scoreNow })] }), (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: styles.block, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('progressCard.change') }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h1", children: typeof stats.delta === "number" ? `${stats.delta > 0 ? "+" : ""}${stats.delta}` : "—" })] })] }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: styles.footer, children: (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: (0, i18n_1.t)('progressCard.footer') }) })] }));
});
const styles = react_native_1.StyleSheet.create({
    card: {
        width: 320,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        gap: 12,
    },
    row: { flexDirection: "row", gap: 12 },
    block: { flex: 1, gap: 4 },
    footer: { marginTop: 6 },
});
