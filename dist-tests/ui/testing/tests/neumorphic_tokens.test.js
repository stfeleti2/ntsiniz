"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const react_1 = __importDefault(require("react"));
const colors_1 = require("../../tokens/colors");
const elevation_1 = require("../../tokens/elevation");
const render_1 = require("../render");
const Surface_1 = require("../../primitives/Surface");
(0, node_test_1.default)('neumorphic tokens expose semantic surface colors', () => {
    strict_1.default.equal(typeof colors_1.colors.surfaceBase, 'string');
    strict_1.default.equal(typeof colors_1.colors.surfaceRaised, 'string');
    strict_1.default.equal(typeof colors_1.colors.surfaceInset, 'string');
    strict_1.default.equal(typeof colors_1.colors.surfaceGlass, 'string');
    strict_1.default.equal(typeof colors_1.colors.accentLavender, 'string');
    strict_1.default.equal(typeof colors_1.colors.accentCyan, 'string');
});
(0, node_test_1.default)('neumorphic elevation map is available', () => {
    strict_1.default.ok(elevation_1.elevation.neumorphic.raised.shadowOpacity > 0);
    strict_1.default.ok(elevation_1.elevation.neumorphic.pressed.shadowRadius > 0);
    strict_1.default.ok(elevation_1.elevation.neumorphic.inset.elevation >= 0);
});
(0, node_test_1.default)('surface accepts neumorphic depth + glass tone', () => {
    const tree = (0, render_1.render)(react_1.default.createElement(Surface_1.Surface, {
        tone: 'glass',
        depth: 'pressed',
        accentRole: 'primary',
        testID: 'surface.test',
        children: null,
    }));
    const node = tree.root.findByProps({ testID: 'surface.test' });
    strict_1.default.ok(node);
});
