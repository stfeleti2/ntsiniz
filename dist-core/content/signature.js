"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRsaSha256Signature = verifyRsaSha256Signature;
const errors_1 = require("@/core/util/errors");
const base64_js_1 = require("base64-js");
function pemToDerBytes(pem) {
    const body = pem
        .replace(/-----BEGIN [^-]+-----/g, '')
        .replace(/-----END [^-]+-----/g, '')
        .replace(/\s+/g, '');
    return base64ToBytes(body);
}
function b64ToBytes(b64) {
    return base64ToBytes(b64);
}
function base64ToBytes(b64) {
    // Avoid Node Buffer dependency at runtime. base64-js works in RN/Expo and Node.
    return (0, base64_js_1.toByteArray)(b64);
}
function asArrayBuffer(bytes) {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
async function importRsaPublicKey(pem) {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle)
        return null;
    try {
        const der = pemToDerBytes(pem);
        return await subtle.importKey('spki', asArrayBuffer(der), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    }
    catch (e) {
        (0, errors_1.coreError)('content_signature_import_key_failed', { message: String(e?.message ?? e) });
        return null;
    }
}
async function verifyRsaSha256Signature(args) {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle)
        return { ok: false, reason: 'unsupported' };
    const key = await importRsaPublicKey(args.publicKeyPem);
    if (!key)
        return { ok: false, reason: 'invalid_key' };
    try {
        const enc = new TextEncoder();
        const data = enc.encode(args.dataUtf8);
        const sig = b64ToBytes(args.signatureB64);
        const ok = await subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, asArrayBuffer(sig), asArrayBuffer(data));
        return ok ? { ok: true } : { ok: false, reason: 'invalid_signature' };
    }
    catch (e) {
        (0, errors_1.coreError)('content_signature_verify_failed', { message: String(e?.message ?? e) });
        return { ok: false, reason: 'internal_error' };
    }
}
