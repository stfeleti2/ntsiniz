"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyTabsModule = JourneyTabsModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
const Divider_1 = require("@/ui/primitives/Divider");
/**
 * Simple tabs row used on Journey-like screens.
 * UI-only: the parent owns state.
 */
function JourneyTabsModule({ tabs, activeKey, onChange, testID }) {
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Box, { testID: testID, style: { gap: 8 }, children: [(0, jsx_runtime_1.jsx)(primitives_1.Stack, { direction: "horizontal", gap: 12, align: "center", children: tabs.map((tab) => {
                    const active = tab.key === activeKey;
                    return ((0, jsx_runtime_1.jsx)(primitives_1.Pressable, { onPress: () => onChange(tab.key), testID: testID ? `${testID}.tab.${tab.key}` : undefined, accessibilityRole: "button", accessibilityState: { selected: active }, style: { paddingVertical: 8, paddingHorizontal: 10 }, children: (0, jsx_runtime_1.jsx)(primitives_1.Text, { weight: active ? 'bold' : 'medium', tone: active ? 'default' : 'muted', children: tab.label }) }, tab.key));
                }) }), (0, jsx_runtime_1.jsx)(Divider_1.Divider, {})] }));
}
