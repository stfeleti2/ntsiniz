"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineStatModule = InlineStatModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
/**
 * Small reusable stat row (label/value), used in score cards, summaries, etc.
 */
function InlineStatModule({ label, value, helper, emphasis = 'normal', testID }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { testID: testID, style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flex: 1, paddingRight: 8 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: label }), helper ? ((0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "xs", children: helper })) : null] }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: emphasis === 'strong' ? 'bold' : 'medium', size: "sm", children: value })] }));
}
