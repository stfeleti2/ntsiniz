"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveformSeek = WaveformSeek;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const primitives_1 = require("../primitives");
const theme_1 = require("../theme");
const waveformMath_1 = require("./waveformMath");
/**
 * Real waveform renderer with tap-to-seek.
 * Uses only RN Views (no SVG dependency) and stays fast by keeping the bar count small.
 */
function WaveformSeek({ peaks, progress = 0, onSeek, height = 72, testID, style, disabled }) {
    const { colors, radius } = (0, theme_1.useTheme)();
    const [w, setW] = (0, react_1.useState)(1);
    const widthRef = (0, react_1.useRef)(1);
    const paddingX = 10;
    const bars = (0, react_1.useMemo)(() => {
        const safe = Array.isArray(peaks) ? peaks : [];
        return safe.length ? safe : new Array(72).fill(0);
    }, [peaks]);
    const activeBars = (0, react_1.useMemo)(() => {
        const idx = Math.floor(Math.max(0, Math.min(1, progress)) * bars.length);
        return idx;
    }, [bars.length, progress]);
    const onLayout = (0, react_1.useCallback)((e) => {
        const ww = e.nativeEvent.layout.width;
        widthRef.current = ww;
        setW(ww);
    }, []);
    const seekFromX = (0, react_1.useCallback)((x) => {
        const ww = widthRef.current || w || 1;
        const p = (0, waveformMath_1.progressFromX)(x, ww, paddingX);
        onSeek?.(p);
    }, [onSeek, paddingX, w]);
    const canInteract = !disabled && typeof onSeek === 'function';
    const barWidth = (0, react_1.useMemo)(() => {
        // keep a visible gap at small widths
        const total = bars.length;
        const gap = 2;
        const bw = Math.max(1, Math.floor((w - gap * (total - 1)) / total));
        return { bw, gap };
    }, [bars.length, w]);
    return ((0, jsx_runtime_1.jsxs)(primitives_1.Pressable, { testID: testID, accessibilityRole: "adjustable", accessibilityLabel: testID ? `${testID}.waveform` : 'waveform', disabled: !canInteract, onPress: (e) => {
            seekFromX(e.nativeEvent.locationX);
        }, 
        // Drag-to-seek (responder) for a real scrub feel.
        onStartShouldSetResponder: () => canInteract, onMoveShouldSetResponder: () => canInteract, onResponderGrant: (e) => {
            seekFromX(e.nativeEvent.locationX);
        }, onResponderMove: (e) => {
            seekFromX(e.nativeEvent.locationX);
        }, style: [
            {
                height,
                borderRadius: radius[3],
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                overflow: 'hidden',
            },
            style,
        ], onLayout: onLayout, children: [(0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: paddingX,
                }, children: bars.map((p, i) => {
                    const h = Math.max(2, Math.round((Math.max(0, Math.min(100, p)) / 100) * (height - 18)));
                    const active = i <= activeBars;
                    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                            width: barWidth.bw,
                            marginRight: i === bars.length - 1 ? 0 : barWidth.gap,
                            height: h,
                            borderRadius: 2,
                            backgroundColor: active ? colors.primary : 'rgba(255,255,255,0.18)',
                        } }, i));
                }) }), (0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: 2,
                    left: (0, waveformMath_1.xFromProgress)(progress, w, paddingX),
                    backgroundColor: 'rgba(255,255,255,0.6)',
                } })] }));
}
