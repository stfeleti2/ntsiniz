"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnackbarProvider = SnackbarProvider;
exports.useSnackbar = useSnackbar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const primitives_1 = require("../../primitives");
const theme_1 = require("../../theme");
const Ctx = (0, react_1.createContext)(null);
function SnackbarProvider({ children }) {
    const { colors, radius, spacing, zIndex } = (0, theme_1.useTheme)();
    const [message, setMessage] = (0, react_1.useState)(null);
    const opacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const show = (0, react_1.useCallback)((msg) => {
        setMessage(msg);
        react_native_1.Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
        setTimeout(() => {
            react_native_1.Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
                if (finished)
                    setMessage(null);
            });
        }, 1800);
    }, [opacity]);
    const value = (0, react_1.useMemo)(() => ({ show }), [show]);
    return ((0, jsx_runtime_1.jsxs)(Ctx.Provider, { value: value, children: [children, message ? ((0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { pointerEvents: "box-none", style: {
                    position: 'absolute',
                    left: spacing[4],
                    right: spacing[4],
                    bottom: spacing[6],
                    opacity,
                    zIndex: zIndex.toast,
                }, children: (0, jsx_runtime_1.jsx)(primitives_1.Pressable, { accessibilityRole: "button", accessibilityLabel: message, onPress: () => setMessage(null), style: {
                        backgroundColor: colors.surface2,
                        borderRadius: radius[3],
                        padding: spacing[4],
                        borderWidth: 1,
                        borderColor: colors.border,
                    }, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { children: message }) }) })) : null] }));
}
function useSnackbar() {
    const ctx = (0, react_1.useContext)(Ctx);
    if (!ctx)
        throw new Error('useSnackbar must be used within SnackbarProvider');
    return ctx;
}
