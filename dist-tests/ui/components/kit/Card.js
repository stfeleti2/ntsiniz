"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
const primitives_1 = require("../../primitives");
function Card({ children, style, testID }) {
    return ((0, jsx_runtime_1.jsx)(primitives_1.Surface, { testID: testID, tone: "raised", padding: 16, style: style, children: children }));
}
