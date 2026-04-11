"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackPreview = PlaybackPreview;
const jsx_runtime_1 = require("react/jsx-runtime");
const molecules_1 = require("@/components/ui/molecules");
const organisms_1 = require("@/components/ui/organisms");
function PlaybackPreview() {
    return ((0, jsx_runtime_1.jsxs)(molecules_1.Container, { children: [(0, jsx_runtime_1.jsx)(organisms_1.AppHeader, { title: "Playback", subtitle: "Review your take and seek through waveform." }), (0, jsx_runtime_1.jsx)(organisms_1.PlaybackControlPanel, {}), (0, jsx_runtime_1.jsx)(organisms_1.ChartPanel, {})] }));
}
