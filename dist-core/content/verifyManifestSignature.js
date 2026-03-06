"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyContentManifestSignature = verifyContentManifestSignature;
const errors_1 = require("@/core/util/errors");
const manifest_1 = require("./manifest");
const signature_1 = require("./signature");
const base64_js_1 = require("base64-js");
const manifest = require('@/content/manifests/content.manifest.json');
const sigPayload = (() => {
    try {
        return require('@/content/manifests/content.manifest.sig.json');
    }
    catch {
        return null;
    }
})();
function b64ToUtf8(b64) {
    const bytes = (0, base64_js_1.toByteArray)(b64);
    return new TextDecoder().decode(bytes);
}
async function verifyContentManifestSignature() {
    if (!sigPayload) {
        (0, manifest_1.setManifestSignatureStatus)('failed');
        (0, errors_1.coreError)('content_manifest_signature_missing', { schema: manifest.schema });
        return 'failed';
    }
    // Signed bytes include the manifest schema + entries. This prevents subtle stringify drift.
    const signedUtf8 = b64ToUtf8(sigPayload.signedBytesB64);
    const r = await (0, signature_1.verifyRsaSha256Signature)({
        publicKeyPem: sigPayload.publicKeyPem,
        dataUtf8: signedUtf8,
        signatureB64: sigPayload.signatureB64,
    });
    if (!r.ok) {
        if (r.reason === 'unsupported') {
            (0, manifest_1.setManifestSignatureStatus)('unsupported');
            return 'unsupported';
        }
        (0, manifest_1.setManifestSignatureStatus)('failed');
        (0, errors_1.coreError)('content_manifest_signature_invalid', { reason: r.reason, schema: manifest.schema });
        return 'failed';
    }
    (0, manifest_1.setManifestSignatureStatus)('verified');
    return 'verified';
}
