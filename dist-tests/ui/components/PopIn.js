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
exports.PopIn = PopIn;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
/**
 * Small utility to make items feel “game-native”.
 * Use for chips/badges: staggered pop-in.
 */
function PopIn({ enabled, delayMs, children, }) {
    const v = (0, react_native_reanimated_1.useSharedValue)(enabled ? 0 : 1);
    (0, react_1.useEffect)(() => {
        if (!enabled) {
            v.value = 1;
            return;
        }
        v.value = 0;
        v.value = (0, react_native_reanimated_1.withDelay)(delayMs, (0, react_native_reanimated_1.withSpring)(1, {
            damping: 12,
            stiffness: 180,
        }));
    }, [enabled, delayMs, v]);
    const st = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const opacity = enabled ? (0, react_native_reanimated_1.interpolate)(v.value, [0, 0.35, 1], [0, 1, 1]) : 1;
        const s = enabled ? (0, react_native_reanimated_1.interpolate)(v.value, [0, 1], [0.92, 1]) : 1;
        return {
            opacity,
            transform: [{ scale: s }],
        };
    });
    return (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: st, children: children });
}
