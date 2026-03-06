"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareActionsModule = ShareActionsModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
const kit_1 = require("@/ui/components/kit");
function ShareActionsModule({ primaryLabel, onPrimary, secondaryLabel, onSecondary, toast, testID }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { gap: 10 }, testID: testID, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(kit_1.Button, { label: primaryLabel, onPress: onPrimary, testID: testID ? `${testID}.primary` : undefined }), secondaryLabel && onSecondary ? ((0, jsx_runtime_1.jsx)(kit_1.Button, { label: secondaryLabel, variant: "secondary", onPress: onSecondary, testID: testID ? `${testID}.secondary` : undefined })) : null] }), toast ? ((0, jsx_runtime_1.jsx)(primitives_1.Box, { style: { alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: toast }) })) : null] }));
}
