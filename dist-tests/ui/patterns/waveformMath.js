"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp01 = clamp01;
exports.progressFromX = progressFromX;
exports.xFromProgress = xFromProgress;
function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}
/**
 * Convert a pointer x (in pixels) into progress (0..1), respecting horizontal padding.
 */
function progressFromX(x, width, paddingX) {
    const w = Math.max(1, width);
    const pad = Math.max(0, paddingX);
    const usable = Math.max(1, w - pad * 2);
    return clamp01((x - pad) / usable);
}
/**
 * Convert progress (0..1) into x coordinate (in pixels), respecting horizontal padding.
 */
function xFromProgress(progress, width, paddingX) {
    const w = Math.max(1, width);
    const p = clamp01(progress);
    const pad = Math.max(0, paddingX);
    const usable = Math.max(1, w - pad * 2);
    return pad + p * usable;
}
