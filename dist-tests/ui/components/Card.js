"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("@/ui/primitives");
const theme_1 = require("@/ui/theme");
const useQuality_1 = require("@/ui/quality/useQuality");
function Card({ children, style, tone = "default", testID }) {
    const { colors } = (0, theme_1.useTheme)();
    const q = (0, useQuality_1.useQuality)();
    const borderColor = tone === "glow"
        ? "rgba(255, 61, 206, 0.28)"
        : tone === "warning"
            ? "rgba(255, 176, 32, 0.40)"
            : colors.border;
    return ((0, jsx_runtime_1.jsx)(primitives_1.Surface, { testID: testID, tone: tone === "default" ? "default" : "raised", padding: 16, style: [
            {
                borderWidth: 1,
                borderColor,
            },
            tone === "glow"
                ? {
                    shadowColor: "#FF3DCE",
                    shadowOpacity: 0.22 * q.shadowScale,
                    shadowRadius: 22 * q.shadowScale,
                    shadowOffset: { width: 0, height: 10 },
                }
                : null,
            style,
        ], children: children }));
}
