"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveformSkeleton = WaveformSkeleton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const primitives_1 = require("../primitives");
const theme_1 = require("../theme");
/**
 * Lightweight waveform loading placeholder.
 * Not a stub: indicates decoding/loading while keeping layout stable.
 */
function WaveformSkeleton({ bars = 72, height = 72, testID, style, }) {
    const { colors, radius } = (0, theme_1.useTheme)();
    const peaks = (0, react_1.useMemo)(() => {
        const out = [];
        for (let i = 0; i < bars; i++) {
            // deterministic pseudo-random-ish curve
            const v = Math.abs(Math.sin((i + 1) * 0.73) * Math.cos((i + 3) * 0.41));
            out.push(Math.round(10 + v * 90));
        }
        return out;
    }, [bars]);
    return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { testID: testID, style: [
            {
                height,
                borderRadius: radius[3],
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                overflow: 'hidden',
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            style,
        ], children: peaks.map((p, i) => {
            const h = Math.max(2, Math.round((p / 100) * (height - 18)));
            return ((0, jsx_runtime_1.jsx)(primitives_1.Box, { style: {
                    width: 2,
                    height: h,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                } }, i));
        }) }));
}
