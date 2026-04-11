"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeFinderPreview = RangeFinderPreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const molecules_1 = require("@/components/ui/molecules");
const atoms_1 = require("@/components/ui/atoms");
function RangeFinderPreview() {
    return ((0, jsx_runtime_1.jsxs)(molecules_1.Container, { children: [(0, jsx_runtime_1.jsx)(atoms_1.Heading, { level: 2, children: "Range Finder" }), (0, jsx_runtime_1.jsx)(atoms_1.BodyText, { tone: "muted", children: "Find your stable singing range before harder drills." }), (0, jsx_runtime_1.jsxs)(molecules_1.Card, { tone: "elevated", children: [(0, jsx_runtime_1.jsx)(atoms_1.Heading, { level: 3, children: "Current Zone: A3 - C5" }), (0, jsx_runtime_1.jsx)(atoms_1.HelperText, { children: "Signal quality: Good" })] }), (0, jsx_runtime_1.jsx)(atoms_1.PrimaryButton, { label: "Start Range Test" })] }));
}
