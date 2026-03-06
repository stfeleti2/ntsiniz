"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptRowCompactModule = AttemptRowCompactModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const i18n_1 = require("@/app/i18n");
const primitives_1 = require("@/ui/primitives");
const patterns_1 = require("@/ui/patterns");
/** Compact attempt row (no waveform). Useful for low-end devices and dense lists. */
function AttemptRowCompactModule({ attempt, index, isBest, drillTitleById, onPress, parentTestID, }) {
    const title = drillTitleById ? drillTitleById(attempt.drillId) : attempt.drillId;
    const dateLabel = new Date(attempt.createdAt).toLocaleDateString();
    const score = Math.round(attempt.score);
    const Container = onPress ? primitives_1.Pressable : primitives_1.Box;
    return ((0, jsx_runtime_1.jsx)(Container, { testID: parentTestID ? `${parentTestID}.item.${index}` : undefined, ...(onPress ? { onPress, accessibilityRole: 'button' } : null), style: { paddingVertical: 10, paddingHorizontal: 12 }, children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", align: "center", justify: "space-between", gap: 12, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flex: 1, gap: 2 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: title }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: (0, i18n_1.t)('results.attemptMeta', { date: dateLabel }) })] }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", align: "center", gap: 10, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: (0, i18n_1.t)('results.scoreChip', { score }) }), isBest ? (0, jsx_runtime_1.jsx)(patterns_1.TakeBadge, { status: "best" }) : null] })] }) }));
}
