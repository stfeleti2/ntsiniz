"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elevation = void 0;
// Cross-platform elevation helpers.
exports.elevation = {
    0: { shadowOpacity: 0, elevation: 0 },
    1: { shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    2: { shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
};
