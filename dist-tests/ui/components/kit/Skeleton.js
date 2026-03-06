"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skeleton = Skeleton;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
function Skeleton({ height = 12, width = '100%', radius = 10, style, testID }) {
    const { colors } = (0, theme_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { testID: testID, style: [
            {
                height,
                width,
                borderRadius: radius,
                backgroundColor: 'rgba(255,255,255,0.10)',
                borderWidth: 1,
                borderColor: colors.border,
            },
            style,
        ] }));
}
