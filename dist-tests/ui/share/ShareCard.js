"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const shareCopy_1 = require("@/core/share/shareCopy");
const i18n_1 = require("@/core/i18n");
/**
 * Render-only card intended to be captured via react-native-view-shot.
 * Keep it deterministic (no animations) so captures are clean.
 */
exports.ShareCard = react_1.default.forwardRef(function ShareCard(props, ref) {
    const footer = props.footer ?? (0, shareCopy_1.getShareFooter)();
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { ref: ref, style: { width: 1080, height: 1080, padding: 56, backgroundColor: '#0B0B10' }, children: [(0, jsx_runtime_1.jsx)(expo_linear_gradient_1.LinearGradient, { colors: ['#0B0B10', '#0E1830', '#0B0B10'], style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { flex: 1, borderRadius: 48, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }, children: (0, jsx_runtime_1.jsxs)(expo_linear_gradient_1.LinearGradient, { colors: ['rgba(55, 227, 255, 0.12)', 'rgba(168, 85, 247, 0.10)', 'rgba(255,255,255,0.02)'], style: { flex: 1, padding: 56 }, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '700', letterSpacing: 2 }, children: (0, i18n_1.t)('brand.name') }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { marginTop: 22 }, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: 'white', fontSize: 54, fontWeight: '900', lineHeight: 58 }, numberOfLines: 3, children: props.title }), !!props.subtitle && ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: 'rgba(255,255,255,0.72)', fontSize: 22, marginTop: 18 }, numberOfLines: 3, children: props.subtitle }))] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { flex: 1 } }), props.children, props.children ? (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 24 } }) : null, (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [!!props.badge && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start' }, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: 'white', fontWeight: '900', fontSize: 18 }, children: props.badge }) })), !!footer && ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: 'rgba(255,255,255,0.55)', marginTop: 14, fontSize: 16 }, children: footer }))] }), !!props.scoreValue && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { alignItems: 'flex-end' }, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: 'rgba(255,255,255,0.60)', fontSize: 16, fontWeight: '700' }, children: props.scoreLabel ?? (0, i18n_1.t)('share.scoreLabel') }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: 'white', fontSize: 72, fontWeight: '900', marginTop: 6 }, children: props.scoreValue })] }))] })] }) })] }));
});
