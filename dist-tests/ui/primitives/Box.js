"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
exports.Box = react_1.default.forwardRef(function Box({ style, testID, row, gap, h, w, ...rest }, ref) {
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { ref: ref, testID: testID, ...rest, style: [
            row ? { flexDirection: 'row' } : null,
            typeof gap === 'number' ? { gap } : null,
            typeof h === 'number' ? { height: h } : null,
            typeof w === 'number' ? { width: w } : null,
            style,
        ] }));
});
