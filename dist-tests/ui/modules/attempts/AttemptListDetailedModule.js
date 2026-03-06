"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptListDetailedModule = AttemptListDetailedModule;
const jsx_runtime_1 = require("react/jsx-runtime");
const AttemptListModule_1 = require("./AttemptListModule");
function AttemptListDetailedModule(props) {
    return (0, jsx_runtime_1.jsx)(AttemptListModule_1.AttemptListModule, { ...props, variant: "detailed" });
}
