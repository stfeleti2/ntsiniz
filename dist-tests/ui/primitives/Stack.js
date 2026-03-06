"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = Stack;
const jsx_runtime_1 = require("react/jsx-runtime");
const Box_1 = require("./Box");
const theme_1 = require("../theme");
function Stack({ direction = 'vertical', gap = 0, align, justify, style, children, testID, }) {
    const { spacing } = (0, theme_1.useTheme)();
    const resolvedGap = typeof gap === 'number' ? gap : spacing[gap];
    const isRow = direction === 'horizontal';
    return ((0, jsx_runtime_1.jsx)(Box_1.Box, { testID: testID, style: [
            {
                flexDirection: isRow ? 'row' : 'column',
                gap: resolvedGap,
                alignItems: align,
                justifyContent: justify,
            },
            style,
        ], children: children }));
}
