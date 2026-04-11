"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottomSheetView = exports.BottomSheetBackdrop = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const BottomSheet = react_1.default.forwardRef(function BottomSheet(props, ref) {
    react_1.default.useImperativeHandle(ref, () => ({
        snapToIndex: () => { },
        close: () => { },
        expand: () => { },
    }));
    return (0, jsx_runtime_1.jsx)(react_native_1.View, { testID: props.testID ?? 'stub.bottom-sheet', children: props.children });
});
const BottomSheetBackdrop = ({ children }) => (0, jsx_runtime_1.jsx)(react_native_1.View, { children: children });
exports.BottomSheetBackdrop = BottomSheetBackdrop;
const BottomSheetView = ({ children }) => (0, jsx_runtime_1.jsx)(react_native_1.View, { children: children });
exports.BottomSheetView = BottomSheetView;
exports.default = BottomSheet;
