"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gesture = void 0;
exports.GestureDetector = GestureDetector;
const react_1 = __importDefault(require("react"));
exports.Gesture = {
    Pan() {
        return {
            onBegin() {
                return this;
            },
            onUpdate() {
                return this;
            },
            onEnd() {
                return this;
            },
        };
    },
};
function GestureDetector(props) {
    return react_1.default.createElement('GestureDetector', props, props?.children);
}
