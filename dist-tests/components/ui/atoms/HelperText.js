"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelperText = HelperText;
const jsx_runtime_1 = require("react/jsx-runtime");
const TextBase_1 = require("./TextBase");
function HelperText({ tone = 'muted', ...rest }) {
    return (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { ...rest, tone: tone, size: "sm", weight: "medium" });
}
