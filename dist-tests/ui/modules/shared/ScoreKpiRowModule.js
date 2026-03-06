"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreKpiRowModule = ScoreKpiRowModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
function ScoreKpiRowModule({ label, value, tone = 'muted', testID }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, accessibilityRole: "text", testID: testID, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: tone, size: "sm", children: label }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: tone, size: "sm", weight: "bold", children: value })] }));
}
