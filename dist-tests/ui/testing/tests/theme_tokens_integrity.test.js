"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const tokens_1 = require("@/theme/tokens");
(0, node_test_1.default)('spacing tokens keep expected scale order', () => {
    const numericKeys = Object.keys(tokens_1.spacing)
        .filter((k) => /^\d+$/.test(k))
        .map((k) => Number(k))
        .sort((a, b) => a - b);
    strict_1.default.deepEqual(numericKeys, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    strict_1.default.equal(tokens_1.spacing[4] > tokens_1.spacing[3], true);
});
(0, node_test_1.default)('radius and typography tokens are present for shared primitives', () => {
    strict_1.default.equal(tokens_1.radius[3] > tokens_1.radius[2], true);
    strict_1.default.equal(typeof tokens_1.typography.size.md, 'number');
    strict_1.default.equal(typeof tokens_1.typography.lineHeight.md, 'number');
    strict_1.default.equal(typeof tokens_1.typography.weight.semibold, 'string');
});
(0, node_test_1.default)('elevation tiers include neumorphic surface map', () => {
    strict_1.default.ok(tokens_1.elevation.neumorphic.flat);
    strict_1.default.ok(tokens_1.elevation.neumorphic.raised);
    strict_1.default.ok(tokens_1.elevation.neumorphic.inset);
    strict_1.default.ok(tokens_1.elevation.neumorphic.pressed);
    strict_1.default.ok(tokens_1.elevation.neumorphic.glass);
});
