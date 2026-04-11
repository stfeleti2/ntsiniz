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
exports.BottomSheet = exports.BottomSheetPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const bottom_sheet_1 = __importStar(require("@gorhom/bottom-sheet"));
exports.BottomSheet = bottom_sheet_1.default;
const provider_1 = require("@/theme/provider");
exports.BottomSheetPanel = (0, react_1.forwardRef)(function BottomSheetPanel({ snapPoints = ['45%', '80%'], children, ...rest }, ref) {
    const { colors } = (0, provider_1.useTheme)();
    const points = (0, react_1.useMemo)(() => snapPoints, [snapPoints]);
    return ((0, jsx_runtime_1.jsx)(bottom_sheet_1.default, { ref: ref, index: -1, snapPoints: points, enablePanDownToClose: true, backgroundStyle: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border }, handleIndicatorStyle: { backgroundColor: colors.borderStrong }, backdropComponent: (props) => (0, jsx_runtime_1.jsx)(bottom_sheet_1.BottomSheetBackdrop, { ...props, disappearsOnIndex: -1, appearsOnIndex: 0 }), ...rest, children: (0, jsx_runtime_1.jsx)(bottom_sheet_1.BottomSheetView, { style: styles.content, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { flex: 1 }, children: children }) }) }));
});
const styles = react_native_1.StyleSheet.create({
    content: {
        flex: 1,
        padding: 16,
    },
});
