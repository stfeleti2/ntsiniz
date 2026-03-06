"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_test_renderer_1 = __importDefault(require("react-test-renderer"));
const theme_1 = require("../theme");
function render(ui) {
    let tree;
    react_test_renderer_1.default.act(() => {
        tree = react_test_renderer_1.default.create((0, jsx_runtime_1.jsx)(theme_1.ThemeProvider, { children: ui }));
    });
    return tree;
}
