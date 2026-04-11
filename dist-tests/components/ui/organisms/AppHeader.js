"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppHeader = AppHeader;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Heading_1 = require("@/components/ui/atoms/Heading");
const HelperText_1 = require("@/components/ui/atoms/HelperText");
const provider_1 = require("@/theme/provider");
function AppHeader({ title, subtitle }) {
    const { spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: spacing[1] }, children: [(0, jsx_runtime_1.jsx)(Heading_1.Heading, { level: 1, children: title }), subtitle ? (0, jsx_runtime_1.jsx)(HelperText_1.HelperText, { children: subtitle }) : null] }));
}
