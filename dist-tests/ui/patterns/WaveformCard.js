"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveformCard = WaveformCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const kit_1 = require("../components/kit");
const primitives_1 = require("../primitives");
const i18n_1 = require("@/app/i18n");
function WaveformCard({ title, subtitle, statusLabel, rightSlot, children, contentHeight = 64, testID, style, }) {
    return ((0, jsx_runtime_1.jsxs)(kit_1.Card, { testID: testID, style: style, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", justify: "space-between", align: "center", style: { gap: 10 }, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Stack, { gap: 2, style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", children: title }), subtitle ? (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: subtitle }) : null] }), (0, jsx_runtime_1.jsxs)(primitives_1.Stack, { direction: "horizontal", align: "center", gap: 8, children: [rightSlot, statusLabel ? (0, jsx_runtime_1.jsx)(kit_1.Badge, { label: statusLabel }) : null] })] }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { height: 12 } }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                    height: contentHeight,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.10)',
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }, children: children ?? ((0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: (0, i18n_1.t)('common.waveformSlot') })) })] }));
}
