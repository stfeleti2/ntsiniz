"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const react_1 = __importDefault(require("react"));
const render_1 = require("../render");
const WaveformPlayerModule_1 = require("../../modules/playback/WaveformPlayerModule");
(0, node_test_1.default)('WaveformPlayerModule renders waveform and buttons', () => {
    const r = (0, render_1.render)(react_1.default.createElement(WaveformPlayerModule_1.WaveformPlayerModule, {
        testID: 'player',
        loading: false,
        peaks: [10, 40, 80, 20],
        progress: 0.25,
        progressLabel: '00:01 / 00:04',
        isPlaying: false,
        onToggle: () => { },
        onRestart: () => { },
        onSeek: () => { },
    }));
    strict_1.default.ok(r.root.findByProps({ testID: 'player.waveform' }));
    strict_1.default.ok(r.root.findByProps({ testID: 'player.toggle' }));
    strict_1.default.ok(r.root.findByProps({ testID: 'player.restart' }));
});
