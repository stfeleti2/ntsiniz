"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionHeaderModule = SectionHeaderModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
/**
 * Reusable section header with optional right-side action.
 * UI-only (no business logic).
 */
function SectionHeaderModule({ title, subtitle, actionLabel, onAction, onActionPress, testID }) {
    const handleAction = onAction ?? onActionPress;
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { testID: testID, style: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)(primitives_1.Box, { style: { flex: 1, gap: 2 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", size: "md", children: title }), subtitle ? ((0, jsx_runtime_1.jsx)(primitives_1.Text, { tone: "muted", size: "sm", children: subtitle })) : null] }), actionLabel && handleAction ? ((0, jsx_runtime_1.jsx)(primitives_1.Pressable, { onPress: handleAction, accessibilityRole: "button", accessibilityLabel: actionLabel, testID: testID ? `${testID}.action` : undefined, style: { paddingHorizontal: 10, paddingVertical: 6 }, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: "bold", size: "sm", children: actionLabel }) })) : null] }));
}
