"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicPermissionPreview = MicPermissionPreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const molecules_1 = require("@/components/ui/molecules");
const atoms_1 = require("@/components/ui/atoms");
function MicPermissionPreview() {
    return ((0, jsx_runtime_1.jsxs)(molecules_1.Container, { children: [(0, jsx_runtime_1.jsx)(atoms_1.Heading, { level: 2, children: "Microphone Access" }), (0, jsx_runtime_1.jsx)(atoms_1.BodyText, { tone: "muted", children: "We only use the mic during active singing drills." }), (0, jsx_runtime_1.jsx)(molecules_1.StatusBanner, { title: "Permission needed", body: "Enable microphone to continue into calibration.", tone: "warning" }), (0, jsx_runtime_1.jsx)(atoms_1.PrimaryButton, { label: "Allow Microphone" }), (0, jsx_runtime_1.jsx)(atoms_1.GhostButton, { label: "Not Now" })] }));
}
