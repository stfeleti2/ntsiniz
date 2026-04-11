"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = Container;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
function Container({ children, style, testID, }) {
    const { spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { testID: testID, style: [
            {
                gap: spacing[3],
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[4],
            },
            style,
        ], children: children }));
}
