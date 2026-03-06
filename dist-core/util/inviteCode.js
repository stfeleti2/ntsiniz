"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInviteCode = makeInviteCode;
exports.parseInviteCode = parseInviteCode;
const base64_js_1 = require("base64-js");
const PREFIX = 'NTS1';
function checksum(payload) {
    let h = 7;
    for (let i = 0; i < payload.length; i++)
        h = (h * 31 + payload.charCodeAt(i)) % 36;
    return h.toString(36).toUpperCase();
}
function toBase64Url(s) {
    const bytes = new TextEncoder().encode(s);
    return (0, base64_js_1.fromByteArray)(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function fromBase64Url(s) {
    try {
        const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
        return new TextDecoder().decode((0, base64_js_1.toByteArray)(padded));
    }
    catch {
        return null;
    }
}
function makeInviteCode(userId) {
    const payload = toBase64Url(userId);
    return `${PREFIX}-${payload}${checksum(payload)}`;
}
function parseInviteCode(input) {
    const raw = String(input ?? '').trim();
    const m = raw.match(/^NTS1-([A-Za-z0-9_-]+)$/);
    if (!m)
        return null;
    const withCheck = m[1];
    if (withCheck.length < 2)
        return null;
    const payload = withCheck.slice(0, -1);
    const got = withCheck.slice(-1).toUpperCase();
    if (checksum(payload) !== got)
        return null;
    const userId = fromBase64Url(payload);
    if (!userId)
        return null;
    return { userId };
}
