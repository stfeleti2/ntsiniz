"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Easing = void 0;
exports.useSharedValue = useSharedValue;
exports.useAnimatedStyle = useAnimatedStyle;
exports.withSpring = withSpring;
exports.withTiming = withTiming;
exports.withRepeat = withRepeat;
exports.interpolate = interpolate;
exports.runOnJS = runOnJS;
const react_1 = __importDefault(require("react"));
const AnimatedView = react_1.default.forwardRef((props, ref) => react_1.default.createElement('Animated.View', { ...props, ref }, props.children));
const Animated = {
    View: AnimatedView,
};
exports.default = Animated;
exports.Easing = {
    out: (x) => x,
    in: (x) => x,
    inOut: (x) => x,
    linear: {},
    quad: {},
    cubic: {},
    bezier: () => ({}),
};
function useSharedValue(value) {
    return { value };
}
function useAnimatedStyle(fn) {
    return fn();
}
function withSpring(value) {
    return value;
}
function withTiming(value) {
    return value;
}
function withRepeat(value) {
    return value;
}
function interpolate(value) {
    return value;
}
function runOnJS(fn) {
    return fn;
}
