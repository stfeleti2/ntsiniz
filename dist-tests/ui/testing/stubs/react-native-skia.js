"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skia = exports.LinearGradient = exports.Circle = exports.Path = exports.Group = exports.Line = exports.RoundedRect = exports.Rect = exports.Canvas = void 0;
exports.vec = vec;
const react_1 = __importDefault(require("react"));
function pass(name) {
    return function Component(props) {
        return react_1.default.createElement(name, props, props?.children);
    };
}
exports.Canvas = pass('Canvas');
exports.Rect = pass('Rect');
exports.RoundedRect = pass('RoundedRect');
exports.Line = pass('Line');
exports.Group = pass('Group');
exports.Path = pass('Path');
exports.Circle = pass('Circle');
exports.LinearGradient = pass('LinearGradient');
exports.Skia = {
    Path: {
        Make() {
            return {
                moveTo() { },
                lineTo() { },
            };
        },
    },
};
function vec(x, y) {
    return { x, y };
}
