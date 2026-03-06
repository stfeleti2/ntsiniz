"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = Text;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
const presetMap = {
    h1: { size: "2xl", weight: "bold" },
    h2: { size: "lg", weight: "bold" },
    h3: { size: "md", weight: "semibold" },
    body: { size: "md", weight: "medium" },
    muted: { size: "sm", weight: "medium", tone: "muted" },
    mono: { size: "sm", weight: "medium", style: { fontFamily: "Courier" } },
    caption: { size: "xs", weight: "medium", tone: "muted" },
};
function Text({ children, preset = "body", size, weight, tone, muted, style, numberOfLines, testID, ...rest }) {
    const p = presetMap[preset];
    const resolvedTone = muted ? "muted" : tone ?? p.tone;
    return ((0, jsx_runtime_1.jsx)(primitives_1.Text, { testID: testID, numberOfLines: numberOfLines, size: size ?? p.size, weight: weight ?? p.weight, tone: resolvedTone, style: [p.style, style], ...rest, children: children }));
}
