"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrillPreview = DrillPreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const molecules_1 = require("@/components/ui/molecules");
const organisms_1 = require("@/components/ui/organisms");
function DrillPreview() {
    return ((0, jsx_runtime_1.jsxs)(molecules_1.Container, { children: [(0, jsx_runtime_1.jsx)(organisms_1.AppHeader, { title: "Pitch Match Drill", subtitle: "Stay centered in the target note." }), (0, jsx_runtime_1.jsx)(organisms_1.DrillControlPanel, { status: "Live monitoring ready" }), (0, jsx_runtime_1.jsx)(organisms_1.ChartPanel, {})] }));
}
