"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stableStringify = stableStringify;
function stableStringify(value) {
    return JSON.stringify(sortValue(value));
}
function sortValue(v) {
    if (Array.isArray(v))
        return v.map(sortValue);
    if (v && typeof v === 'object') {
        const out = {};
        for (const k of Object.keys(v).sort())
            out[k] = sortValue(v[k]);
        return out;
    }
    return v;
}
