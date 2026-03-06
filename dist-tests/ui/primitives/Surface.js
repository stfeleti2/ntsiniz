"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Surface = Surface;
const jsx_runtime_1 = require("react/jsx-runtime");
const Box_1 = require("./Box");
const theme_1 = require("../theme");
function Surface({ tone = 'default', padding = 0, radius, style, children, testID }) {
    const { colors, elevation: elev, radius: r } = (0, theme_1.useTheme)();
    const bg = tone === 'transparent' ? 'transparent' : tone === 'raised' ? colors.surface2 : colors.surface;
    const shadow = tone === 'raised' ? elev[1] : elev[0];
    return ((0, jsx_runtime_1.jsx)(Box_1.Box, { testID: testID, style: [
            {
                backgroundColor: bg,
                padding,
                borderRadius: radius ?? r[2],
                borderWidth: tone === 'transparent' ? 0 : 1,
                borderColor: colors.border,
                shadowColor: '#000',
                ...shadow,
            },
            style,
        ], children: children }));
}
