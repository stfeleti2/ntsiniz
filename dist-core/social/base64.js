"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.b64UrlEncodeJson = b64UrlEncodeJson;
exports.b64UrlDecodeJson = b64UrlDecodeJson;
const base64_js_1 = require("base64-js");
const safeJson_1 = require("@/core/utils/safeJson");
function utf8ToBytes(str) {
    // TextEncoder is available on modern RN/Hermes. Provide a fallback.
    if (typeof globalThis.TextEncoder === 'function') {
        return new globalThis.TextEncoder().encode(str);
    }
    // Fallback: encodeURIComponent -> binary string
    const bin = unescape(encodeURIComponent(str));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        bytes[i] = bin.charCodeAt(i);
    return bytes;
}
function bytesToUtf8(bytes) {
    if (typeof globalThis.TextDecoder === 'function') {
        return new globalThis.TextDecoder('utf-8').decode(bytes);
    }
    let bin = '';
    for (let i = 0; i < bytes.length; i++)
        bin += String.fromCharCode(bytes[i]);
    return decodeURIComponent(escape(bin));
}
function b64UrlEncodeJson(obj) {
    const json = JSON.stringify(obj);
    const b64 = (0, base64_js_1.fromByteArray)(utf8ToBytes(json));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function b64UrlDecodeJson(code) {
    const pad = code.length % 4 === 0 ? '' : '='.repeat(4 - (code.length % 4));
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const bytes = (0, base64_js_1.toByteArray)(b64);
    const json = bytesToUtf8(bytes);
    return (0, safeJson_1.safeJsonParse)(json, {});
}
