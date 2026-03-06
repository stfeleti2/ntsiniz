"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioRoutePill = AudioRoutePill;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const Typography_1 = require("./Typography");
function labelForRoute(route) {
    if (!route)
        return '…';
    const t = route.routeType;
    if (t === 'built_in_mic')
        return 'Built-in mic';
    if (t === 'wired_headset')
        return 'Headset mic';
    if (t === 'bluetooth_sco')
        return 'Bluetooth mic';
    if (t === 'bluetooth_a2dp')
        return 'Bluetooth (output)';
    if (t === 'bluetooth_le')
        return 'Bluetooth LE mic';
    return 'Unknown input';
}
function AudioRoutePill({ route, onPress }) {
    const label = labelForRoute(route);
    const warn = route?.isBluetoothInput;
    return ((0, jsx_runtime_1.jsx)(react_native_1.Pressable, { onPress: onPress, style: { alignSelf: 'flex-start' }, accessibilityRole: "button", children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: {
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: warn ? 'rgba(255,120,120,0.6)' : 'rgba(255,255,255,0.18)',
                backgroundColor: warn ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.06)',
            }, children: (0, jsx_runtime_1.jsx)(Typography_1.Text, { style: { fontSize: 12, opacity: 0.9 }, children: label }) }) }));
}
