"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSummaryPreview = SessionSummaryPreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const molecules_1 = require("@/components/ui/molecules");
const organisms_1 = require("@/components/ui/organisms");
function SessionSummaryPreview() {
    return ((0, jsx_runtime_1.jsxs)(molecules_1.Container, { children: [(0, jsx_runtime_1.jsx)(organisms_1.AppHeader, { title: "Session Complete", subtitle: "Your consistency improved today." }), (0, jsx_runtime_1.jsx)(organisms_1.SessionSummaryPanel, { score: 86 })] }));
}
