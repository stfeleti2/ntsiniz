"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const react_1 = __importDefault(require("react"));
const render_1 = require("../render");
const RecordingOverlay_1 = require("../../patterns/RecordingOverlay");
const RecorderHUD_1 = require("../../patterns/RecorderHUD");
const WaveformCard_1 = require("../../patterns/WaveformCard");
(0, node_test_1.default)('RecordingOverlay stop button calls onStop', () => {
    let stop = 0;
    const r = (0, render_1.render)(react_1.default.createElement(RecordingOverlay_1.RecordingOverlay, {
        visible: true,
        elapsedLabel: '00:01',
        onStop: () => (stop += 1),
        onPause: () => { },
        mode: 'pill',
        testID: 'rec',
    }));
    const stopBtn = r.root.findByProps({ testID: 'rec.stop' });
    stopBtn.props.onPress();
    strict_1.default.equal(stop, 1);
});
(0, node_test_1.default)('RecorderHUD renders', () => {
    const r = (0, render_1.render)(react_1.default.createElement(RecorderHUD_1.RecorderHUD, { elapsedLabel: '00:02', testID: 'hud' }));
    const node = r.root.findByProps({ testID: 'hud' });
    strict_1.default.ok(node);
});
(0, node_test_1.default)('WaveformCard renders title', () => {
    const r = (0, render_1.render)(react_1.default.createElement(WaveformCard_1.WaveformCard, { title: 'Take 1', testID: 'wf' }));
    const title = r.root.findByProps({ children: 'Take 1' });
    strict_1.default.ok(title);
});
