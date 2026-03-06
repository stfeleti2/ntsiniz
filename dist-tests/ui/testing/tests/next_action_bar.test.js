"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const react_1 = __importDefault(require("react"));
const render_1 = require("../render");
const NextActionBar_1 = require("@/ui/components/NextActionBar");
(0, node_test_1.default)('NextActionBar renders title + primary button', () => {
    const r = (0, render_1.render)(react_1.default.createElement(NextActionBar_1.NextActionBar, {
        title: 'What now?',
        subtitle: 'Do one small thing.',
        primaryLabel: 'Start',
        onPrimary: () => { },
    }));
    strict_1.default.ok(r.root.findByProps({ children: 'What now?' }));
    strict_1.default.ok(r.root.findByProps({ text: 'Start' }));
});
