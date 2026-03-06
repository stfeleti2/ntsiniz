"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pressable = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
/**
 * Thin wrapper over RN Pressable that:
 * - accepts testID + a11y props
 * - defaults accessibilityRole to 'button' when onPress exists
 * - wires accessibilityState.disabled when disabled
 */
exports.Pressable = react_1.default.forwardRef(function Pressable({ style, accessibilityRole, accessibilityState, disabled, onPress, ...rest }, ref) {
    const role = accessibilityRole ?? (onPress ? 'button' : undefined);
    const mergedA11yState = {
        ...accessibilityState,
        disabled: disabled ?? accessibilityState?.disabled,
    };
    return ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { ref: ref, ...rest, onPress: disabled ? undefined : onPress, disabled: disabled, accessibilityRole: role, accessibilityState: mergedA11yState, style: style }));
});
