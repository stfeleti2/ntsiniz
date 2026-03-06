"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spacer = Spacer;
const jsx_runtime_1 = require("react/jsx-runtime");
const Box_1 = require("./Box");
function Spacer({ size = 8, horizontal = false, testID }) {
    return (0, jsx_runtime_1.jsx)(Box_1.Box, { testID: testID, style: horizontal ? { width: size } : { height: size } });
}
