"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyMap = JourneyMap;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const useTheme_1 = require("@/theme/useTheme");
const Typography_1 = require("@/ui/components/Typography");
const Button_1 = require("@/ui/components/Button");
const Card_1 = require("@/ui/components/Card");
const ui_1 = require("@/ui");
function JourneyMap({ nodes, onStartMission }) {
    const t = (0, useTheme_1.useTheme)();
    return ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: { gap: 12 }, children: nodes.map((n, idx) => {
            const isNext = n.status === "next";
            const complete = n.status === "complete";
            const accent = isNext ? t.colors.accent2 : complete ? t.colors.good : t.colors.line;
            const side = idx % 2 === 0 ? "left" : "right";
            const emoji = emojiFor(n);
            return ((0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { entering: react_native_reanimated_1.FadeInDown.duration(250).delay(idx * 40), children: (0, jsx_runtime_1.jsxs)(Card_1.Card, { tone: isNext ? "glow" : "default", style: [
                        styles.node,
                        {
                            borderColor: accent,
                            backgroundColor: isNext ? "rgba(20, 24, 36, 0.9)" : t.colors.card,
                        },
                        side === "right" ? { alignSelf: "flex-end" } : null,
                    ], children: [(0, jsx_runtime_1.jsxs)(ui_1.Box, { style: styles.row, children: [(0, jsx_runtime_1.jsx)(ui_1.Box, { style: [
                                        styles.dot,
                                        {
                                            backgroundColor: complete ? t.colors.good : isNext ? t.colors.accent : "rgba(255,255,255,0.12)",
                                        },
                                    ], children: (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "body", style: { fontSize: 14, fontWeight: "900" }, children: emoji }) }), (0, jsx_runtime_1.jsxs)(ui_1.Box, { style: { flex: 1, gap: 4 }, children: [(0, jsx_runtime_1.jsxs)(ui_1.Box, { style: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "h2", style: { fontSize: 18 }, children: n.title }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", style: { fontWeight: "800" }, children: complete ? "DONE" : isNext ? "NEXT" : n.status === "unlocked" ? "OPEN" : "LOCK" })] }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { preset: "muted", children: n.subtitle }), isNext ? ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { text: "Start this mission", onPress: () => onStartMission?.(n) }) })) : null] })] }), idx < nodes.length - 1 ? ((0, jsx_runtime_1.jsx)(ui_1.Box, { style: [styles.connector, { backgroundColor: complete ? "rgba(46, 229, 157, 0.35)" : "rgba(255,255,255,0.08)" }] })) : null] }) }, n.id));
        }) }));
}
function emojiFor(n) {
    if (n.id === "baseline")
        return "👀";
    if (n.id === "steady_hold")
        return "🧘";
    if (n.id === "clean_start")
        return "⚡";
    if (n.id === "smooth_slide")
        return "🧊";
    if (n.id === "intervals")
        return "🎶";
    if (n.id === "melody_echo")
        return "🎼";
    if (n.id === "level_up")
        return "🏁";
    return "✨";
}
const styles = react_native_1.StyleSheet.create({
    node: {
        overflow: "hidden",
        width: "94%",
    },
    row: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 99,
        marginTop: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    connector: {
        position: "absolute",
        left: 30,
        bottom: -26,
        width: 2,
        height: 26,
        borderRadius: 99,
    },
});
