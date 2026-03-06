"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconButton = IconButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
function IconButton({ icon, onPress, disabled, size = 40, style, testID, accessibilityLabel }) {
    const { colors, radius } = (0, theme_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(primitives_1.Pressable, { testID: testID, accessibilityRole: "button", accessibilityLabel: accessibilityLabel ?? icon, disabled: disabled, onPress: onPress, style: ({ pressed }) => [
            {
                width: size,
                height: size,
                borderRadius: radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
            },
            style,
        ], children: (0, jsx_runtime_1.jsx)(primitives_1.Icon, { name: icon }) }));
}
