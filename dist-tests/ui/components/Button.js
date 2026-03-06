"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
const jsx_runtime_1 = require("react/jsx-runtime");
const Haptics = __importStar(require("expo-haptics"));
const kit_1 = require("@/ui/components/kit");
function Button({ text, title, children, onPress, disabled, variant = "primary", style, haptic = "light", testID }) {
    const mappedVariant = variant === "soft" || variant === "secondary" ? "secondary" : variant === "ghost" ? "ghost" : "primary";
    const label = text ?? title ?? (typeof children === "string" ? children : "");
    const doHaptic = async () => {
        if (disabled || haptic === "none")
            return;
        try {
            if (haptic === "medium")
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            else
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        catch {
            // ignore
        }
    };
    return ((0, jsx_runtime_1.jsx)(kit_1.Button, { testID: testID, label: label, variant: mappedVariant, disabled: disabled, onPress: async () => {
            await doHaptic();
            onPress?.();
        }, style: style }));
}
