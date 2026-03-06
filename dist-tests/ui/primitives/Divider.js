"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Divider = Divider;
const jsx_runtime_1 = require("react/jsx-runtime");
const Box_1 = require("./Box");
const theme_1 = require("../theme");
function Divider({ testID }) {
    const { colors } = (0, theme_1.useTheme)();
    return (0, jsx_runtime_1.jsx)(Box_1.Box, { testID: testID, style: { height: 1, backgroundColor: colors.border, width: '100%' } });
}
