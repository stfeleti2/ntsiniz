"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomePreview = WelcomePreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const molecules_1 = require("@/components/ui/molecules");
const organisms_1 = require("@/components/ui/organisms");
const atoms_1 = require("@/components/ui/atoms");
const provider_1 = require("@/theme/provider");
function WelcomePreview() {
    const { spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsxs)(molecules_1.Container, { children: [(0, jsx_runtime_1.jsx)(organisms_1.AppHeader, { title: "Ntsiniz", subtitle: "A fair ear for your voice." }), (0, jsx_runtime_1.jsx)(molecules_1.StatusBanner, { title: "Welcome back", body: "Let us sharpen your voice in one focused session.", tone: "info" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(atoms_1.PrimaryButton, { label: "Start" }), (0, jsx_runtime_1.jsx)(atoms_1.GhostButton, { label: "Skip" })] })] }));
}
