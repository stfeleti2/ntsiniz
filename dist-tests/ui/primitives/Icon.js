"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = Icon;
const jsx_runtime_1 = require("react/jsx-runtime");
const Text_1 = require("./Text");
// Placeholder icon wrapper (swap for a real icon set later)
function Icon({ name, size = 16, testID }) {
    return ((0, jsx_runtime_1.jsx)(Text_1.Text, { testID: testID, size: "sm", style: { fontSize: size, lineHeight: size }, accessibilityLabel: name, children: name }));
}
