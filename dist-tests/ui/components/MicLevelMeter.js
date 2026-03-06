"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicLevelMeter = MicLevelMeter;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const i18n_1 = require("@/core/i18n");
function MicLevelMeter(props) {
    const peak = Math.max(0, Math.min(1, props.peak ?? 0));
    const clipped = !!props.clipped;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { accessibilityLabel: (0, i18n_1.t)('recording.micLevelLabel'), style: { gap: 6 }, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 8, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 8, width: `${Math.round(peak * 100)}%`, borderRadius: 99, backgroundColor: clipped ? '#ff4d4d' : 'rgba(255,255,255,0.7)' } }) }), clipped ? ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontSize: 12, opacity: 0.9 }, children: (0, i18n_1.t)('recording.clippingWarning') })) : ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { fontSize: 12, opacity: 0.7 }, children: (0, i18n_1.t)('recording.clippingOk') }))] }));
}
