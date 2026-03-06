"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = Badge;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
function Badge({ label, tone = 'default', style, testID, }) {
    const { colors, radius, spacing } = (0, theme_1.useTheme)();
    const bg = tone === 'success'
        ? 'rgba(46, 204, 113, 0.16)'
        : tone === 'danger'
            ? 'rgba(255, 77, 77, 0.16)'
            : tone === 'warning'
                ? 'rgba(255, 176, 32, 0.16)'
                : 'rgba(124, 92, 255, 0.16)';
    const textTone = tone === 'default' ? 'default' : tone;
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { testID: testID, style: [
            {
                alignSelf: 'flex-start',
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[1],
                borderRadius: radius.pill,
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: colors.border,
            },
            style,
        ], children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { size: "xs", tone: textTone, weight: "semibold", children: label }) }));
}
