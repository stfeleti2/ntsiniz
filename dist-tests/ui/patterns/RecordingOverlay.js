"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingOverlay = RecordingOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const primitives_1 = require("../primitives");
const theme_1 = require("../theme");
const kit_1 = require("../components/kit");
const i18n_1 = require("@/app/i18n");
function RecordingOverlay({ visible, mode = 'full', elapsedLabel, onStop, onPause, onResume, onMinimize, paused, testID, style, children, }) {
    const { colors, spacing, radius, zIndex } = (0, theme_1.useTheme)();
    if (!visible)
        return null;
    const content = ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { testID: testID, style: [
            mode === 'full'
                ? {
                    flex: 1,
                    backgroundColor: colors.overlay,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: spacing[6],
                }
                : {
                    position: 'absolute',
                    left: spacing[4],
                    right: spacing[4],
                    top: spacing[6],
                    zIndex: zIndex.overlay,
                },
            style,
        ], children: [mode === 'full' && children ? ((0, jsx_runtime_1.jsx)(primitives_1.Box, { pointerEvents: "none", style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, children: children })) : null, (0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: {
                    width: '100%',
                    maxWidth: 520,
                    backgroundColor: colors.surface2,
                    borderRadius: radius[4],
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing[4],
                }, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", justify: "space-between", align: "center", children: [(0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 2, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: (0, i18n_1.t)('common.recording') }), (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", children: elapsedLabel })] }), mode === 'full' && onMinimize ? (0, jsx_runtime_1.jsx)(kit_1.IconButton, { icon: "_", onPress: onMinimize, testID: testID ? `${testID}.minimize` : undefined }) : null] }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { height: 14 } }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", gap: 12, align: "center", justify: "space-between", children: [onStop ? ((0, jsx_runtime_1.jsx)(kit_1.Button, { testID: testID ? `${testID}.stop` : undefined, label: (0, i18n_1.t)('common.stop'), variant: "danger", onPress: onStop })) : null, paused ? (onResume ? ((0, jsx_runtime_1.jsx)(kit_1.Button, { testID: testID ? `${testID}.resume` : undefined, label: (0, i18n_1.t)('common.resume'), variant: "secondary", onPress: onResume })) : null) : onPause ? ((0, jsx_runtime_1.jsx)(kit_1.Button, { testID: testID ? `${testID}.pause` : undefined, label: (0, i18n_1.t)('common.pause'), variant: "secondary", onPress: onPause })) : null] })] })] }));
    if (mode === 'pill')
        return content;
    return ((0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: visible, transparent: true, animationType: "fade", children: (0, jsx_runtime_1.jsx)(primitives_1.Pressable, { accessibilityRole: "button", accessibilityLabel: (0, i18n_1.t)('common.dismiss'), onPress: onMinimize, style: { flex: 1 }, children: content }) }));
}
