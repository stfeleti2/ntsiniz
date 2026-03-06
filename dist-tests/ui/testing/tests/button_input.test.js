"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const react_1 = __importDefault(require("react"));
const render_1 = require("../render");
const Button_1 = require("../../components/kit/Button");
const Input_1 = require("../../components/kit/Input");
(0, node_test_1.default)('Button renders label', () => {
    const r = (0, render_1.render)(react_1.default.createElement(Button_1.Button, { label: 'Go', onPress: () => { }, testID: 'btn' }));
    const label = r.root.findByProps({ children: 'Go' });
    strict_1.default.ok(label);
});
(0, node_test_1.default)('Button disabled blocks press', () => {
    let pressed = 0;
    const r = (0, render_1.render)(react_1.default.createElement(Button_1.Button, { label: 'Go', onPress: () => (pressed += 1), disabled: true, testID: 'btn' }));
    const btn = r.root.findByProps({ testID: 'btn' });
    strict_1.default.equal(btn.props.disabled, true);
});
(0, node_test_1.default)('Input calls onChangeText', () => {
    let last = '';
    const r = (0, render_1.render)(react_1.default.createElement(Input_1.Input, {
        value: '',
        onChangeText: (v) => (last = v),
        placeholder: 'Type',
        testID: 'input',
    }));
    const input = r.root.findByProps({ testID: 'input' });
    input.props.onChangeText('abc');
    strict_1.default.equal(last, 'abc');
});
