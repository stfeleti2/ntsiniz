"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setManifestSignatureStatus = setManifestSignatureStatus;
exports.getManifestSignatureStatus = getManifestSignatureStatus;
exports.computeEntryHashFromObject = computeEntryHashFromObject;
exports.verifyManifestEntry = verifyManifestEntry;
const stableStringify_1 = require("../util/stableStringify");
const sha256_1 = require("../util/sha256");
let manifestSigStatus = 'unknown';
function setManifestSignatureStatus(s) {
    manifestSigStatus = s;
}
function getManifestSignatureStatus() {
    return manifestSigStatus;
}
function computeEntryHashFromObject(obj) {
    return (0, sha256_1.sha256Hex)((0, stableStringify_1.stableStringify)(obj));
}
function verifyManifestEntry(entry, obj) {
    const h = computeEntryHashFromObject(obj);
    if (h !== entry.sha256)
        return { ok: false, reason: `hash_mismatch expected=${entry.sha256} got=${h}` };
    return { ok: true };
}
