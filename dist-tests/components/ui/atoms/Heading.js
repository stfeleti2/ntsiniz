"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heading = Heading;
const jsx_runtime_1 = require("react/jsx-runtime");
const TextBase_1 = require("./TextBase");
const levelMap = {
    1: '2xl',
    2: 'xl',
    3: 'lg',
};
function Heading({ level = 1, tone = 'default', ...rest }) {
    return (0, jsx_runtime_1.jsx)(TextBase_1.AppText, { ...rest, tone: tone, size: levelMap[level], weight: "bold" });
}
