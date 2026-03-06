"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecorderHUD = RecorderHUD;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../primitives");
const theme_1 = require("../theme");
const i18n_1 = require("@/app/i18n");
function RecorderHUD({ elapsedLabel, levelLabel = (0, i18n_1.t)('dev.level'), testID, style, }) {
    const { colors, spacing, radius, zIndex } = (0, theme_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { testID: testID, style: [
            {
                position: 'absolute',
                top: spacing[6],
                left: spacing[4],
                right: spacing[4],
                zIndex: zIndex.overlay,
                borderRadius: radius[4],
                backgroundColor: 'rgba(20,20,33,0.85)',
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[3],
            },
            style,
        ], children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", justify: "space-between", align: "center", children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: elapsedLabel }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 8, align: "center", children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: levelLabel }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                                width: 60,
                                height: 8,
                                borderRadius: radius.pill,
                                backgroundColor: 'rgba(255,255,255,0.12)',
                                borderWidth: 1,
                                borderColor: colors.border,
                            } })] })] }) }));
}
