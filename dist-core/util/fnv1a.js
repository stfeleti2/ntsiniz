"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fnv1a32 = fnv1a32;
function fnv1a32(input) {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        // h *= 16777619 with uint32 overflow
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('00000000' + h.toString(16)).slice(-8);
}
