"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const provider_1 = require("@/theme/provider");
const neumorphism_1 = require("@/theme/neumorphism");
const variants = ['flat', 'raised', 'inset', 'pressed', 'glass'];
(0, node_test_1.default)('neumorphism states expose bounded alpha values', () => {
    for (const variant of variants) {
        const rule = (0, neumorphism_1.getNeumorphismRule)(variant, 'default');
        strict_1.default.equal(rule.borderAlpha >= 0 && rule.borderAlpha <= 1, true);
        strict_1.default.equal(rule.shadowAlpha >= 0 && rule.shadowAlpha <= 1, true);
        strict_1.default.equal(rule.highlightAlpha >= 0 && rule.highlightAlpha <= 1, true);
    }
});
(0, node_test_1.default)('light and dark themes produce surface style for every variant', () => {
    const dark = (0, provider_1.buildTheme)({ mode: 'dark' });
    const light = (0, provider_1.buildTheme)({ mode: 'light' });
    for (const variant of variants) {
        const darkStyle = (0, neumorphism_1.getNeumorphicSurfaceStyle)(dark, { variant, quality: 'full' });
        const lightStyle = (0, neumorphism_1.getNeumorphicSurfaceStyle)(light, { variant, quality: 'full' });
        strict_1.default.equal(typeof darkStyle.backgroundColor, 'string');
        strict_1.default.equal(typeof lightStyle.backgroundColor, 'string');
        strict_1.default.equal(typeof darkStyle.borderColor, 'string');
        strict_1.default.equal(typeof lightStyle.borderColor, 'string');
    }
});
