"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const render_1 = require("../render");
const AttemptListModule_1 = require("@/ui/modules/attempts/AttemptListModule");
(0, node_test_1.default)('AttemptListModule renders empty state', () => {
    const tree = (0, render_1.render)((0, jsx_runtime_1.jsx)(AttemptListModule_1.AttemptListModule, { attempts: [], testID: "attempt.list" }));
    strict_1.default.ok(tree.root.findByProps({ testID: 'attempt.list' }));
});
