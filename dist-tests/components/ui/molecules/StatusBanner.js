"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBanner = StatusBanner;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
const Heading_1 = require("@/components/ui/atoms/Heading");
const BodyText_1 = require("@/components/ui/atoms/BodyText");
function StatusBanner({ title, body, tone = 'info', testID, }) {
    const { colors, radius } = (0, provider_1.useTheme)();
    const backgroundColor = tone === 'success'
        ? 'rgba(53, 148, 101, 0.24)'
        : tone === 'warning'
            ? 'rgba(207, 138, 47, 0.2)'
            : tone === 'danger'
                ? 'rgba(217, 65, 115, 0.2)'
                : 'rgba(93, 117, 190, 0.22)';
    const borderColor = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.secondary;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { testID: testID, style: {
            borderWidth: 1,
            borderColor,
            borderRadius: radius[3],
            padding: 12,
            gap: 6,
            backgroundColor,
        }, children: [(0, jsx_runtime_1.jsx)(Heading_1.Heading, { level: 3, children: title }), body ? (0, jsx_runtime_1.jsx)(BodyText_1.BodyText, { tone: "muted", children: body }) : null] }));
}
