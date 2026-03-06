"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const react_1 = __importDefault(require("react"));
const render_1 = require("../render");
const primitives_1 = require("../../primitives");
(0, node_test_1.default)('Box renders with testID', () => {
    const r = (0, render_1.render)(react_1.default.createElement(primitives_1.Box, { testID: 'box' }));
    const node = r.root.findByProps({ testID: 'box' });
    strict_1.default.ok(node);
});
(0, node_test_1.default)('Text renders children', () => {
    const r = (0, render_1.render)(react_1.default.createElement(primitives_1.Text, { testID: 'text' }, 'hello'));
    const node = r.root.findByProps({ testID: 'text' });
    strict_1.default.equal(node.props.children, 'hello');
});
