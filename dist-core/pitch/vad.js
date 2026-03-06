"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vadFromRms = vadFromRms;
function vadFromRms(rms, gate) {
    return { voiced: rms >= gate, rms };
}
