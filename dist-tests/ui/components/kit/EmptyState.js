"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = EmptyState;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../../primitives");
function EmptyState({ title, message, style, testID }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Stack, { testID: testID, gap: 8, align: "center", style: [{ padding: 16 }, style], children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", size: "lg", style: { textAlign: 'center' }, children: title }), message ? ((0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", style: { textAlign: 'center' }, children: message })) : null] }));
}
