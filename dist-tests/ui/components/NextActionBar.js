"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextActionBar = NextActionBar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Card_1 = require("./Card");
const Typography_1 = require("./Typography");
const Button_1 = require("./Button");
const ui_1 = require("@/ui");
/**
 * Persistent “What now?” affordance.
 *
 * Principles:
 * - One clear next step
 * - Works offline
 * - Avoids heavy rendering
 */
function NextActionBar(props) {
    const { title, subtitle, primaryLabel, onPrimary, secondaryLabel, onSecondary, testID } = props;
    const { width } = (0, react_native_1.useWindowDimensions)();
    const stackButtons = width < 420;
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { testID: testID ?? 'next.action', tone: "glow", children: (0, jsx_runtime_1.jsxs)(ui_1.Box, { style: { gap: 10 }, children: [(0, jsx_runtime_1.jsxs)(ui_1.Box, { style: { gap: 4 }, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h3", children: title }), subtitle ? (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: subtitle }) : null] }), (0, jsx_runtime_1.jsxs)(ui_1.Box, { style: { flexDirection: stackButtons ? 'column' : 'row', gap: 8, flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { text: primaryLabel, testID: props.primaryTestID, onPress: onPrimary }), secondaryLabel && onSecondary ? (0, jsx_runtime_1.jsx)(Button_1.Button, { text: secondaryLabel, testID: props.secondaryTestID, variant: "ghost", onPress: onSecondary }) : null] })] }) }));
}
