"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const render_1 = require("../render");
const molecules_1 = require("@/components/ui/molecules");
const atoms_1 = require("@/components/ui/atoms");
(0, node_test_1.default)('bottom sheet panel renders and exposes content', () => {
    const tree = (0, render_1.render)((0, jsx_runtime_1.jsx)(molecules_1.BottomSheetPanel, { snapPoints: ['40%'], testID: "ui.bottom-sheet", children: (0, jsx_runtime_1.jsx)(atoms_1.Heading, { level: 3, children: "Panel" }) }));
    const panel = tree.root.findByProps({ testID: 'ui.bottom-sheet' });
    strict_1.default.ok(panel);
    strict_1.default.ok(tree.root.findByType(atoms_1.Heading));
});
