"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyText = BodyText;
const jsx_runtime_1 = require("react/jsx-runtime");
const TextBase_1 = require("./TextBase");
function BodyText({ tone = 'default', ...rest }) {
    return (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { ...rest, tone: tone, size: "md", weight: "medium" });
}
