"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalSheet = ModalSheet;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const provider_1 = require("@/theme/provider");
function ModalSheet({ visible, onClose, children, }) {
    const { colors, radius, spacing } = (0, provider_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: visible, transparent: true, animationType: "slide", onRequestClose: onClose, children: (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { style: styles.backdrop, onPress: onClose, children: (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { onPress: () => { }, style: [
                    styles.sheet,
                    {
                        backgroundColor: colors.surfaceRaised,
                        borderTopLeftRadius: radius[4],
                        borderTopRightRadius: radius[4],
                        borderColor: colors.border,
                        padding: spacing[4],
                    },
                ], children: children }) }) }));
}
const styles = react_native_1.StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        minHeight: 180,
        borderWidth: 1,
    },
});
