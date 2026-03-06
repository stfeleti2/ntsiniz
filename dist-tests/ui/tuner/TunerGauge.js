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
exports.TunerGauge = TunerGauge;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const useTheme_1 = require("@/theme/useTheme");
const ui_1 = require("@/ui");
const i18n_1 = require("@/core/i18n");
function TunerGauge({ cents, windowCents = 25 }) {
    const t = (0, useTheme_1.useTheme)();
    const c = clamp(cents, -50, 50);
    // map cents to angle (-60..60)
    const angle = (c / 50) * 60;
    const cx = 160;
    const cy = 120;
    const r = 90;
    const rad = (Math.PI / 180) * angle;
    const x2 = cx + r * Math.sin(rad);
    const y2 = cy - r * Math.cos(rad);
    const left = polar(cx, cy, r, -60);
    const right = polar(cx, cy, r, 60);
    const arc = describeArc(cx, cy, r, -60, 60);
    const winLeft = polar(cx, cy, r, (-windowCents / 50) * 60);
    const winRight = polar(cx, cy, r, (windowCents / 50) * 60);
    return ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: { borderRadius: 22, overflow: "hidden" }, children: (0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: 320, height: 200, children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: arc, stroke: t.colors.line, strokeWidth: 10, fill: "none", strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: describeArc(cx, cy, r, (-windowCents / 50) * 60, (windowCents / 50) * 60), stroke: t.colors.good, strokeWidth: 10, fill: "none", strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: left.x, y1: left.y, x2: left.x, y2: left.y + 10, stroke: t.colors.muted, strokeWidth: 2 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: right.x, y1: right.y, x2: right.x, y2: right.y + 10, stroke: t.colors.muted, strokeWidth: 2 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: winLeft.x, y1: winLeft.y, x2: winLeft.x, y2: winLeft.y + 8, stroke: t.colors.good, strokeWidth: 2 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: winRight.x, y1: winRight.y, x2: winRight.x, y2: winRight.y + 8, stroke: t.colors.good, strokeWidth: 2 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: cx, y1: cy, x2: x2, y2: y2, stroke: t.colors.text, strokeWidth: 4, strokeLinecap: "round" }), (0, jsx_runtime_1.jsxs)(react_native_svg_1.Text, { x: cx, y: 190, fontSize: 14, fill: t.colors.muted, textAnchor: "middle", children: [(0, i18n_1.formatNumber)(c, { maximumFractionDigits: 0, minimumFractionDigits: 0 }), " cents"] })] }) }));
}
function clamp(x, a, b) {
    return Math.max(a, Math.min(b, x));
}
function polar(cx, cy, r, angleDeg) {
    const a = (Math.PI / 180) * angleDeg;
    return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
}
function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polar(cx, cy, r, endAngle);
    const end = polar(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}
