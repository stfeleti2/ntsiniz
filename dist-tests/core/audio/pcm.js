"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pcmBase64ToFloat32 = pcmBase64ToFloat32;
exports.rms = rms;
/**
 * Decode 16-bit PCM base64 into Float32 samples (-1..1).
 *
 * Perf: allow callers to pass a reusable output buffer to avoid per-frame
 * allocations (important on low-end Android).
 */
function pcmBase64ToFloat32(pcmBase64, reuseOut) {
    const bytes = base64ToBytes(pcmBase64);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const n = Math.floor(bytes.byteLength / 2);
    const out = reuseOut && reuseOut.length === n ? reuseOut : new Float32Array(n);
    for (let i = 0; i < n; i++)
        out[i] = view.getInt16(i * 2, true) / 32768;
    return out;
}
function rms(samples) {
    let sum = 0;
    for (let i = 0; i < samples.length; i++)
        sum += samples[i] * samples[i];
    return Math.sqrt(sum / Math.max(1, samples.length));
}
function base64ToBytes(b64) {
    // Prefer standards-based atob when available (Node 16+, modern JS engines)
    const atobFn = globalThis.atob;
    if (typeof atobFn === "function") {
        const bin = atobFn(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++)
            out[i] = bin.charCodeAt(i) & 255;
        return out;
    }
    // Node fallback
    const Buf = globalThis.Buffer;
    if (Buf)
        return new Uint8Array(Buf.from(b64, "base64"));
    // Minimal manual decoder fallback
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    const clean = b64.replace(/[^A-Za-z0-9+/=]/g, "");
    const out = [];
    for (let i = 0; i < clean.length; i += 4) {
        const a = alphabet.indexOf(clean[i]);
        const b = alphabet.indexOf(clean[i + 1]);
        const c = alphabet.indexOf(clean[i + 2]);
        const d = alphabet.indexOf(clean[i + 3]);
        const triple = (a << 18) | (b << 12) | ((c & 63) << 6) | (d & 63);
        const o1 = (triple >> 16) & 255;
        const o2 = (triple >> 8) & 255;
        const o3 = triple & 255;
        out.push(o1);
        if (clean[i + 2] !== "=")
            out.push(o2);
        if (clean[i + 3] !== "=")
            out.push(o3);
    }
    return new Uint8Array(out);
}
