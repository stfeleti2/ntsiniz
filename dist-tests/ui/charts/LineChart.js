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
exports.LineChart = LineChart;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const useTheme_1 = require("@/theme/useTheme");
const ui_1 = require("@/ui");
function LineChart({ values, height = 120, padding = 10, showDots = true }) {
    const t = (0, useTheme_1.useTheme)();
    const [w, setW] = (0, react_1.useState)(0);
    const { d, dots } = (0, react_1.useMemo)(() => {
        if (!w || values.length < 2)
            return { d: "", dots: [] };
        const min = Math.min(...values);
        const max = Math.max(...values);
        const span = Math.max(1, max - min);
        const innerW = Math.max(1, w - padding * 2);
        const innerH = Math.max(1, height - padding * 2);
        const pts = values.map((v, i) => {
            const x = padding + (innerW * i) / Math.max(1, values.length - 1);
            const y = padding + innerH - ((v - min) / span) * innerH;
            return { x, y };
        });
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
        return { d: path, dots: pts };
    }, [w, values, height, padding]);
    return ((0, jsx_runtime_1.jsx)(ui_1.Box, { onLayout: (e) => setW(e.nativeEvent.layout.width), style: { height, width: "100%", borderRadius: 16, overflow: "hidden", backgroundColor: t.colors.card }, children: (0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: w, height: height, children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: d, stroke: t.colors.accent, strokeWidth: 3, fill: "none" }), showDots &&
                    dots.map((p, i) => ((0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: p.x, cy: p.y, r: 4, fill: t.colors.accent }, i)))] }) }));
}
