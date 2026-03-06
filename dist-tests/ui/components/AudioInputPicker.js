"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioInputPicker = AudioInputPicker;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const Typography_1 = require("./Typography");
const Button_1 = require("./Button");
const routeManager_1 = require("@/core/audio/routeManager");
const i18n_1 = require("@/core/i18n");
function AudioInputPicker({ visible, onClose, onSelected, currentUid, }) {
    const [inputs, setInputs] = (0, react_1.useState)([]);
    const [busy, setBusy] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        (0, routeManager_1.listInputs)().then(setInputs).catch(() => setInputs([]));
    }, [visible]);
    async function choose(uid) {
        setBusy(true);
        try {
            await (0, routeManager_1.setPreferredInput)(uid);
            onSelected(uid);
            onClose();
        }
        finally {
            setBusy(false);
        }
    }
    return ((0, jsx_runtime_1.jsxs)(react_native_1.Modal, { visible: visible, animationType: "slide", transparent: true, onRequestClose: onClose, children: [(0, jsx_runtime_1.jsx)(react_native_1.Pressable, { style: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }, onPress: onClose }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#0b0d16', padding: 16, maxHeight: '70%' }, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { style: { fontSize: 16, fontWeight: '700', marginBottom: 8 }, children: (0, i18n_1.t)('audioInputPicker.title', 'Select microphone') }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { style: { fontSize: 12, opacity: 0.75, marginBottom: 12 }, children: (0, i18n_1.t)('audioInputPicker.subtitle', 'Wired or built-in mics usually sound best. Bluetooth mics can be lower quality and add latency.') }), (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { text: (0, i18n_1.t)('audioInputPicker.systemDefault', 'System default'), onPress: () => choose(null), disabled: busy }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 10 } }), inputs.map((i, idx) => {
                                const selected = currentUid && i.inputUid === currentUid;
                                const key = i.inputUid ?? (i.inputName ? `name:${i.inputName}` : `idx:${idx}`);
                                return ((0, jsx_runtime_1.jsxs)(react_native_1.Pressable, { onPress: () => choose(i.inputUid ?? null), style: {
                                        padding: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: selected ? 'rgba(120,180,255,0.8)' : 'rgba(255,255,255,0.12)',
                                        backgroundColor: selected ? 'rgba(120,180,255,0.12)' : 'rgba(255,255,255,0.04)',
                                        marginBottom: 8,
                                    }, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { style: { fontSize: 14, fontWeight: '600' }, children: i.inputName || (0, i18n_1.t)('audioInputPicker.input', 'Input') }), (0, jsx_runtime_1.jsxs)(Typography_1.Text, { style: { fontSize: 12, opacity: 0.75 }, children: [i.routeType, i.isBluetoothInput ? ` ${(0, i18n_1.t)('audioInputPicker.bluetoothTag', '(Bluetooth)')}` : ''] })] }, key));
                            })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 10 } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { text: (0, i18n_1.t)('common.close', 'Close'), variant: "soft", onPress: onClose, disabled: busy })] })] }));
}
