"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptListCompactModule = AttemptListCompactModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const AttemptListModule_1 = require("./AttemptListModule");
function AttemptListCompactModule(props) {
    return (0, jsx_runtime_1.jsx)(AttemptListModule_1.AttemptListModule, { ...props, variant: "compact" });
}
