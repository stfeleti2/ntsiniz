"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackOverlay = PlaybackOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../primitives");
const kit_1 = require("../components/kit");
const theme_1 = require("../theme");
const i18n_1 = require("@/app/i18n");
function PlaybackOverlay({ isPlaying, progressLabel, onToggle, testID, style, }) {
    const { colors, spacing, radius } = (0, theme_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { testID: testID, style: [
            {
                position: 'absolute',
                left: spacing[4],
                right: spacing[4],
                bottom: spacing[6],
                backgroundColor: 'rgba(20,20,33,0.92)',
                borderRadius: radius[4],
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[4],
            },
            style,
        ], children: (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", align: "center", justify: "space-between", children: [(0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 2, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: (0, i18n_1.t)('common.playback') }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: progressLabel })] }), (0, jsx_runtime_1.jsx)(kit_1.Button, { testID: testID ? `${testID}.toggle` : undefined, label: isPlaying ? (0, i18n_1.t)('common.pause') : (0, i18n_1.t)('common.play'), onPress: onToggle, disabled: !onToggle, variant: "secondary" })] }) }));
}
