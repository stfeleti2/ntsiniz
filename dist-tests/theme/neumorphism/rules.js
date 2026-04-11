"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neumorphismRules = void 0;
exports.getNeumorphismRule = getNeumorphismRule;
exports.neumorphismRules = [
    { variant: 'flat', state: 'default', borderAlpha: 0.22, shadowAlpha: 0, highlightAlpha: 0 },
    { variant: 'raised', state: 'default', borderAlpha: 0.26, shadowAlpha: 0.42, highlightAlpha: 0.2 },
    { variant: 'inset', state: 'default', borderAlpha: 0.28, shadowAlpha: 0.16, highlightAlpha: 0.14 },
    { variant: 'pressed', state: 'default', borderAlpha: 0.26, shadowAlpha: 0.24, highlightAlpha: 0.1 },
    { variant: 'glass', state: 'default', borderAlpha: 0.36, shadowAlpha: 0.36, highlightAlpha: 0.24 },
    { variant: 'raised', state: 'pressed', borderAlpha: 0.22, shadowAlpha: 0.2, highlightAlpha: 0.08 },
    { variant: 'raised', state: 'disabled', borderAlpha: 0.16, shadowAlpha: 0.12, highlightAlpha: 0.06 },
];
function getNeumorphismRule(variant, state) {
    return exports.neumorphismRules.find((rule) => rule.variant === variant && rule.state === state) ??
        exports.neumorphismRules.find((rule) => rule.variant === variant && rule.state === 'default') ??
        exports.neumorphismRules[0];
}
